import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, SocietyStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { RequestUser } from "../../common/auth/request-user.interface";
import { PrismaService } from "../../common/database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { RegisterClientDto } from "./dto/register-client.dto";
import { RegisterSocietyDto } from "./dto/register-society.dto";

const userProfileInclude = Prisma.validator<Prisma.UserInclude>()({
  society: {
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
      acceptsDigitalPayments: true,
      upiId: true,
      billingEmail: true,
      billingPhone: true,
      createdAt: true,
      updatedAt: true,
      subscription: true
    }
  },
  customerProfile: true,
  subscription: true
});

type UserProfileRecord = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

type RegistrationIdentity = {
  fullName: string;
  username: string;
};

type RegistrationPayload = {
  fullName: string;
  password: string;
  societyCode: string;
  username: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(dto: LoginDto) {
    const username = dto.username.trim();
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: userProfileInclude
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.buildLoginResponse(user);
  }

  async listActiveSocieties() {
    // Some DB states may not yet include a `status` column (migrations differ).
    // `isActive` is always available, so we rely on that for the frontend society list.
    return this.prisma.society.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    });
  }

  async registerClient(dto: RegisterClientDto) {
    const identity = this.normalizeIdentity(dto.username, dto.fullName);
    await this.assertUsernameAvailable(identity.username);
    const society = await this.findActiveSocietyByCode(dto.societyCode);

    const customerCount = await this.prisma.customer.count({ where: { societyId: society.id } });
    const customerCode = `${society.code}-C${String(customerCount + 1).padStart(5, "0")}`;
    const passwordHash = await hash(dto.password, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          customerCode,
          societyId: society.id,
          firstName: identity.fullName,
          phone: dto.phone?.trim() || undefined,
          address: dto.address?.trim() || undefined,
          kycVerified: false
        }
      });

      const user = await tx.user.create({
        data: {
          username: identity.username,
          passwordHash,
          fullName: identity.fullName,
          role: UserRole.CLIENT,
          societyId: society.id,
          customerId: customer.id
        }
      });

      await this.createFreeSubscription(tx, user.id);
      return this.loadUserProfile(tx, user.id, "Failed to provision subscription profile");
    });

    return this.buildLoginResponse(created);
  }

  async registerAgentSelf(dto: RegisterAgentDto) {
    const created = await this.provisionFreeUser(dto, UserRole.AGENT, "Failed to provision agent profile");
    return this.buildLoginResponse(created);
  }

  async registerSociety(dto: RegisterSocietyDto) {
    try {
      const societyCode = dto.societyCode.trim().toUpperCase();

      // Avoid selecting `status` when DB may not have that column yet (legacy/migration gap)
      const existingSociety = await this.prisma.society.findUnique({
        where: { code: societyCode },
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true
        }
      });

      if (existingSociety) {
        throw new ConflictException("Society code already exists");
      }

      const society = await this.prisma.society.create({
        data: {
          code: societyCode,
          name: dto.fullName,
          isActive: true
        }
      });

      const identity = this.normalizeIdentity(dto.username, dto.fullName);
      await this.assertUsernameAvailable(identity.username);
      const passwordHash = await hash(dto.password, 10);

      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: identity.username,
            passwordHash,
            fullName: identity.fullName,
            role: UserRole.SUPER_USER,
            societyId: society.id
          }
        });

        await tx.subscription.create({
          data: {
            userId: user.id,
            plan: SubscriptionPlan.FREE,
            status: SubscriptionStatus.ACTIVE,
            monthlyPrice: 0
          }
        });

        return this.loadUserProfile(tx, user.id, "Failed to provision society profile");
      });

      return this.buildLoginResponse(created);
    } catch (error) {
      console.error('[AuthService.registerSociety] error', error);
      throw error;
    }
  }

  async registerAgent(dto: RegisterAgentDto) {
    const created = await this.provisionFreeUser(dto, UserRole.AGENT, "Failed to load agent profile");

    return {
      id: created.id,
      username: created.username,
      fullName: created.fullName,
      role: created.role,
      society: created.society,
      subscription: this.formatSubscription(created.subscription)
    };
  }

  async me(currentUser: RequestUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: userProfileInclude
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      ...this.buildUserProfile(user),
      isActive: user.isActive
    };
  }

  private normalizeIdentity(username: string, fullName: string): RegistrationIdentity {
    return {
      username: username.trim(),
      fullName: fullName.trim().replace(/\s+/g, " ")
    };
  }

  private buildLoginResponse(user: UserProfileRecord) {
    return {
      accessToken: this.signToken(this.toRequestUser(user)),
      user: this.buildUserProfile(user)
    };
  }

  private buildUserProfile(user: UserProfileRecord) {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      society: user.society
        ? {
            id: user.society.id,
            code: user.society.code,
            name: user.society.name,
            status: (user.society as any).status ?? SocietyStatus.ACTIVE,
            acceptsDigitalPayments: user.society.acceptsDigitalPayments,
            upiId: user.society.upiId,
            billingEmail: user.society.billingEmail,
            billingPhone: user.society.billingPhone
          }
        : null,
      customerProfile: user.customerProfile,
      subscription: this.resolveEffectiveSubscription(user)
    };
  }

  private toRequestUser(user: Pick<UserProfileRecord, "id" | "username" | "role" | "societyId" | "customerId">): RequestUser {
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
      societyId: user.societyId ?? null,
      customerId: user.customerId ?? null
    };
  }

  private async provisionFreeUser(
    dto: RegistrationPayload,
    role: UserRole,
    errorMessage: string
  ) {
    const identity = this.normalizeIdentity(dto.username, dto.fullName);
    await this.assertUsernameAvailable(identity.username);
    const society = await this.findActiveSocietyByCode(dto.societyCode);
    const passwordHash = await hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: identity.username,
          passwordHash,
          fullName: identity.fullName,
          role,
          societyId: society.id
        }
      });

      await this.createFreeSubscription(tx, user.id);
      return this.loadUserProfile(tx, user.id, errorMessage);
    });
  }

  private async createFreeSubscription(tx: Prisma.TransactionClient, userId: string) {
    await tx.subscription.create({
      data: {
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0
      }
    });
  }

  private async loadUserProfile(tx: Prisma.TransactionClient, userId: string, errorMessage: string) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: userProfileInclude
    });

    if (!user) {
      throw new UnauthorizedException(errorMessage);
    }

    return user;
  }

  private async assertUsernameAvailable(username: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }
  }

  private async findActiveSocietyByCode(societyCode: string) {
    const code = societyCode.trim().toUpperCase();
    const society = await this.prisma.society.findUnique({
      where: { code },
      select: { id: true, code: true, name: true, isActive: true }
    });

    if (!society || !society.isActive) {
      throw new NotFoundException("Society not found");
    }

    return society;
  }

  private resolveEffectiveSubscription(user: UserProfileRecord) {
    if (user.role === UserRole.SUPER_ADMIN) {
      return {
        id: `platform-${user.id}`,
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: new Date(0),
        nextBillingDate: null,
        cancelAtPeriodEnd: false,
        scope: "PLATFORM" as const
      };
    }

    if (user.society) {
      if (user.society.subscription) {
        return {
          ...this.formatSubscription(user.society.subscription),
          scope: "SOCIETY" as const
        };
      }

      return {
        id: `society-${user.society.id}`,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: user.society.createdAt,
        nextBillingDate: null,
        cancelAtPeriodEnd: false,
        scope: "SOCIETY" as const
      };
    }

    if (user.subscription) {
      return {
        ...this.formatSubscription(user.subscription),
        scope: "USER" as const
      };
    }

    return null;
  }

  private signToken(payload: RequestUser) {
    const expiresInSeconds = Number(this.configService.get<string>("JWT_EXPIRES_IN_SECONDS") ?? "86400");

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET") ?? "dev-secret",
      expiresIn: Number.isFinite(expiresInSeconds) ? expiresInSeconds : 86400
    });
  }

  private formatSubscription(
    subscription:
      | {
          id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          monthlyPrice: { toNumber(): number } | number;
          startsAt: Date;
          nextBillingDate: Date | null;
          cancelAtPeriodEnd: boolean;
        }
      | null
  ) {
    if (!subscription) {
      return null;
    }

    const monthlyPrice =
      typeof subscription.monthlyPrice === "number"
        ? subscription.monthlyPrice
        : subscription.monthlyPrice.toNumber();

    return {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      monthlyPrice,
      startsAt: subscription.startsAt,
      nextBillingDate: subscription.nextBillingDate,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    };
  }
}
