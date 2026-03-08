import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { PrismaService } from "../../common/database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { RegisterClientDto } from "./dto/register-client.dto";
import { RequestUser } from "../../common/auth/request-user.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        society: true,
        customerProfile: true
      }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      accessToken: this.signToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        societyId: user.societyId ?? null,
        customerId: user.customerId ?? null
      }),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        society: user.society,
        customerProfile: user.customerProfile
      }
    };
  }

  async registerClient(dto: RegisterClientDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { username: dto.username } });

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const societyCode = dto.societyCode.trim().toUpperCase();
    const society = await this.prisma.society.findUnique({
      where: { code: societyCode },
      select: { id: true, code: true, name: true }
    });

    if (!society) {
      throw new NotFoundException("Society not found");
    }

    const customerCount = await this.prisma.customer.count({ where: { societyId: society.id } });
    const customerCode = `${society.code}-C${String(customerCount + 1).padStart(5, "0")}`;

    const passwordHash = await hash(dto.password, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          customerCode,
          societyId: society.id,
          firstName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          kycVerified: false
        }
      });

      const user = await tx.user.create({
        data: {
          username: dto.username,
          passwordHash,
          fullName: dto.fullName,
          role: UserRole.CLIENT,
          societyId: society.id,
          customerId: customer.id
        },
        include: {
          society: true,
          customerProfile: true
        }
      });

      return user;
    });

    return {
      accessToken: this.signToken({
        sub: created.id,
        username: created.username,
        role: created.role,
        societyId: created.societyId ?? null,
        customerId: created.customerId ?? null
      }),
      user: {
        id: created.id,
        username: created.username,
        fullName: created.fullName,
        role: created.role,
        society: created.society,
        customerProfile: created.customerProfile
      }
    };
  }

  async registerAgent(dto: RegisterAgentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { username: dto.username } });

    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const societyCode = dto.societyCode.trim().toUpperCase();
    const society = await this.prisma.society.findUnique({
      where: { code: societyCode },
      select: { id: true }
    });

    if (!society) {
      throw new NotFoundException("Society not found");
    }

    const passwordHash = await hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        fullName: dto.fullName,
        role: UserRole.AGENT,
        societyId: society.id
      },
      include: {
        society: true
      }
    });

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      society: user.society
    };
  }

  async me(currentUser: RequestUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: {
        society: true,
        customerProfile: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      society: user.society,
      customerProfile: user.customerProfile
    };
  }

  private signToken(payload: RequestUser) {
    const expiresInSeconds = Number(this.configService.get<string>("JWT_EXPIRES_IN_SECONDS") ?? "86400");

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET") ?? "dev-secret",
      expiresIn: Number.isFinite(expiresInSeconds) ? expiresInSeconds : 86400
    });
  }
}
