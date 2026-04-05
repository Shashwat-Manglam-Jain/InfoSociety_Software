import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, SocietyStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { RequestUser } from "../../common/auth/request-user.interface";
import { PrismaService } from "../../common/database/prisma.service";
import { resolveUserAllowedModules, updateUserAllowedModules } from "../../common/database/user-module-access";
import { getDefaultAllowedModules } from "../banking/shared/module-access";
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
      status: true,
      isActive: true,
      imageUrl: true,
      logoUrl: true,
      faviconUrl: true,
      about: true,
      softwareUrl: true,
      cin: true,
      class: true,
      acceptsDigitalPayments: true,
      upiId: true,
      billingEmail: true,
      billingPhone: true,
      billingAddress: true,
      panNo: true,
      tanNo: true,
      gstNo: true,
      category: true,
      authorizedCapital: true,
      paidUpCapital: true,
      shareNominalValue: true,
      registrationDate: true,
      registrationNumber: true,
      registrationState: true,
      registrationAuthority: true,
      createdAt: true,
      updatedAt: true,
      subscription: true
    }
  },
  customerProfile: true,
  subscription: true,
  branch: {
    select: {
      id: true,
      code: true,
      name: true
    }
  }
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
    const input = this.normalizeUsername(dto.username);
    const expectedRole = dto.expectedRole;

    if (expectedRole && expectedRole !== UserRole.SUPER_ADMIN && !dto.societyCode?.trim()) {
      throw new UnauthorizedException("Society code is required for this login portal");
    }
    
    // 1. Attempt to find user by Administrative Handle / Username
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: input,
              mode: "insensitive"
            }
          },
          {
            username: {
              equals: `@${input}`,
              mode: "insensitive"
            }
          }
        ]
      },
      include: userProfileInclude
    });

    // 2. If no direct user match, try to find a society with this unique code
    if (!user) {
      const society = await this.prisma.society.findUnique({
        where: { code: input.toUpperCase() },
        include: {
          users: {
            where: { role: UserRole.SUPER_USER },
            include: userProfileInclude,
            take: 1
          }
        }
      });

      if (society && society.users.length > 0) {
        user = society.users[0] as any;
      }
    }

    if (!user && dto.societyCode?.trim()) {
      const desiredHandle = this.normalizeLooseHandle(dto.username);
      const candidateUsers = await this.prisma.user.findMany({
        where: {
          society: {
            code: dto.societyCode.trim().toUpperCase()
          },
          ...(expectedRole ? { role: expectedRole } : {})
        },
        include: userProfileInclude,
        take: 25
      });

      const matchingUsersByHandle = candidateUsers.filter(
        (candidate) =>
          this.normalizeLooseHandle(candidate.username) === desiredHandle ||
          this.normalizeLooseHandle(candidate.fullName) === desiredHandle
      );

      if (matchingUsersByHandle.length === 1) {
        user = matchingUsersByHandle[0];
      } else if (matchingUsersByHandle.length > 1) {
        throw new UnauthorizedException("Multiple accounts match this handle in the selected society. Please use your exact username.");
      }
    }

    if (!user) {
      if (dto.societyCode?.trim()) {
        const targetSociety = await this.prisma.society.findUnique({
          where: { code: dto.societyCode.trim().toUpperCase() },
          select: {
            id: true,
            status: true,
            isActive: true
          }
        });

        if (targetSociety?.isActive && targetSociety.status === SocietyStatus.ACTIVE) {
          const societyAdminExists = await this.prisma.user.findFirst({
            where: {
              societyId: targetSociety.id,
              role: UserRole.SUPER_USER
            },
            select: {
              id: true
            }
          });

          if (!societyAdminExists) {
            throw new UnauthorizedException(
              "This approved society does not have an administrator login yet. Ask the platform superadmin to re-approve it so a recovery admin can be created."
            );
          }
        }
      }

      throw new UnauthorizedException("User account not found");
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException("User account is deactivated");
    }

    const valid = await compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Incorrect password");
    }

    if (expectedRole && user.role !== expectedRole) {
      throw new UnauthorizedException("Selected access role does not match this account");
    }

    // 4. Institutional Boundary Enforcement (New)
    // If the login is performed via a specific institutional portal (societyCode provided),
    // ensure the user account is actually mapped to that infrastructure.
    if (dto.societyCode) {
      const targetCode = dto.societyCode.trim().toUpperCase();
      const userSocietyCode = user.society?.code?.toUpperCase();

      if (user.role !== UserRole.SUPER_ADMIN && userSocietyCode !== targetCode) {
        throw new UnauthorizedException(`Access Denied: This account is registered to ${userSocietyCode || 'a different infrastructure'} and cannot access the ${targetCode} workspace.`);
      }
    }

    this.assertSocietyAccessAllowed(user);

    return this.buildLoginResponse(user);
  }

  async listActiveSocieties() {
    return this.prisma.society.findMany({
      where: {
        isActive: true,
        status: SocietyStatus.ACTIVE
      },
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

  async listActiveSocietyBranches(societyCode: string) {
    const society = await this.findActiveSocietyByCode(societyCode);

    return this.prisma.branch.findMany({
      where: {
        societyId: society.id,
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        isHead: true
      },
      orderBy: [
        { isHead: "desc" },
        { name: "asc" }
      ]
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
          customerId: customer.id,
          requiresPasswordChange: true
        }
      });

      await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(UserRole.CLIENT));
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

      // Autogenerate username from society code if not provided or to ensure consistent naming
      const autoUsername = this.createInitialSocietyAdminUsername(dto.fullName, societyCode);
      const usernameToUse = dto.username?.trim() || autoUsername;

      const identity = this.normalizeIdentity(usernameToUse, dto.fullName);
      await this.assertUsernameAvailable(identity.username);
      const passwordHash = await hash(dto.password, 10);

      const created = await this.prisma.$transaction(async (tx) => {
        const society = await tx.society.create({
          data: {
            code: societyCode,
            name: dto.societyName.trim(),
            status: SocietyStatus.PENDING,
            isActive: false,
            billingEmail: dto.billingEmail?.trim() || null,
            billingPhone: dto.billingPhone?.trim() || null,
            billingAddress: dto.billingAddress?.trim() || null,
            acceptsDigitalPayments: dto.acceptsDigitalPayments ?? false,
            upiId: dto.upiId?.trim() || null,
            panNo: dto.panNo?.trim().toUpperCase() || null,
            tanNo: dto.tanNo?.trim().toUpperCase() || null,
            gstNo: dto.gstNo?.trim().toUpperCase() || null,
            category: dto.category?.trim() || null,
            authorizedCapital: dto.authorizedCapital ?? null,
            paidUpCapital: dto.paidUpCapital ?? null,
            shareNominalValue: dto.shareNominalValue ?? null,
            registrationDate: dto.registrationDate ? new Date(dto.registrationDate) : null,
            registrationNumber: dto.registrationNumber?.trim() || null,
            registrationState: dto.registrationState?.trim() || null,
            registrationAuthority: dto.registrationAuthority?.trim() || null
          }
        });

        const user = await tx.user.create({
          data: {
            username: identity.username,
            passwordHash,
            fullName: identity.fullName,
            role: UserRole.SUPER_USER,
            societyId: society.id
          }
        });

        await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(UserRole.SUPER_USER));
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
      isActive: user.isActive,
      allowedModuleSlugs: await this.resolveUserAllowedModules(user.id, user.role)
    };
  }

  async changePassword(currentUser: RequestUser, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const valid = await compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Insufficient security clearance: Current password verification failed.");
    }

    const newHash = await hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        requiresPasswordChange: false
      }
    });

    return { success: true, message: "Credential vault updated successfully. Infrastructure access re-authorized." };
  }

  private normalizeIdentity(username: string, fullName: string): RegistrationIdentity {
    return {
      username: this.normalizeUsername(username),
      fullName: this.normalizeFullName(fullName)
    };
  }

  private normalizeUsername(username: string) {
    return username.trim().toLowerCase().replace(/^@+/, "").replace(/\s+/g, "");
  }

  private normalizeFullName(fullName: string) {
    return fullName.trim().replace(/\s+/g, " ");
  }

  private normalizeLooseHandle(value: string) {
    return value.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9]+/g, "");
  }

  private createInitialSocietyAdminUsername(fullName: string, societyCode: string) {
    const slug = this.normalizeFullName(fullName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20);

    if (slug) {
      return slug;
    }

    return `adm_${societyCode.toLowerCase()}`;
  }

  private async buildLoginResponse(user: UserProfileRecord) {
    const allowedModuleSlugs = await this.resolveUserAllowedModules(user.id, user.role);

    return {
      accessToken: this.signToken(this.toRequestUser(user)),
      user: {
        ...this.buildUserProfile(user),
        allowedModuleSlugs
      }
    };
  }

  private buildUserProfile(user: UserProfileRecord) {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId ?? null,
      society: user.society
        ? {
            id: user.society.id,
            code: user.society.code,
            name: user.society.name,
            status: (user.society as any).status ?? SocietyStatus.ACTIVE,
            imageUrl: user.society.imageUrl,
            logoUrl: user.society.logoUrl,
            faviconUrl: user.society.faviconUrl,
            about: user.society.about,
            softwareUrl: user.society.softwareUrl,
            cin: user.society.cin,
            class: user.society.class,
            acceptsDigitalPayments: user.society.acceptsDigitalPayments,
            upiId: user.society.upiId,
            billingEmail: user.society.billingEmail,
            billingPhone: user.society.billingPhone,
            billingAddress: user.society.billingAddress,
            panNo: user.society.panNo,
            tanNo: user.society.tanNo,
            gstNo: user.society.gstNo,
            category: user.society.category,
            authorizedCapital: user.society.authorizedCapital ? Number(user.society.authorizedCapital.toString()) : null,
            paidUpCapital: user.society.paidUpCapital ? Number(user.society.paidUpCapital.toString()) : null,
            shareNominalValue: user.society.shareNominalValue ? Number(user.society.shareNominalValue.toString()) : null,
            registrationDate: user.society.registrationDate,
            registrationNumber: user.society.registrationNumber,
            registrationState: user.society.registrationState,
            registrationAuthority: user.society.registrationAuthority
          }
        : null,
      customerProfile: user.customerProfile,
      subscription: this.resolveEffectiveSubscription(user),
      requiresPasswordChange: user.requiresPasswordChange
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
          societyId: society.id,
          requiresPasswordChange: true
        }
      });

      await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(role));
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
    const normalizedUsername = this.normalizeUsername(username);
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: normalizedUsername,
              mode: "insensitive"
            }
          },
          {
            username: {
              equals: `@${normalizedUsername}`,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true
      }
    });

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }
  }

  private async findActiveSocietyByCode(societyCode: string) {
    const code = societyCode.trim().toUpperCase();
    const society = await this.prisma.society.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        status: true
      }
    });

    if (!society || !society.isActive || society.status !== SocietyStatus.ACTIVE) {
      throw new NotFoundException("Society not found");
    }

    return society;
  }

  private assertSocietyAccessAllowed(user: UserProfileRecord) {
    if (user.role === UserRole.SUPER_ADMIN || !user.society) {
      return;
    }

    const societyStatus = user.society.status ?? SocietyStatus.PENDING;

    if (user.society.isActive && societyStatus === SocietyStatus.ACTIVE) {
      return;
    }

    if (societyStatus === SocietyStatus.PENDING) {
      throw new UnauthorizedException("Your society access is pending platform approval");
    }

    throw new UnauthorizedException("Your society access is currently inactive. Please contact the platform superadmin.");
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

  private async resolveUserAllowedModules(userId: string, role: UserRole) {
    return resolveUserAllowedModules(this.prisma, userId, role);
  }

  private async updateAllowedModules(tx: Prisma.TransactionClient | PrismaService, userId: string, allowedModuleSlugs: string[]) {
    await updateUserAllowedModules(tx, userId, allowedModuleSlugs);
  }
}
