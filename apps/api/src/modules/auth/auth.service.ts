import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AccountStatus, AccountType, LoanStatus, Prisma, SocietyStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { RequestUser } from "../../common/auth/request-user.interface";
import { MemoryCacheService } from "../../common/cache/memory-cache.service";
import { ensureDefaultDepositSchemes } from "../../common/database/default-product-plans";
import { PrismaService } from "../../common/database/prisma.service";
import { UserExtraFieldAvailability, loadUserExtraFieldAvailability } from "../../common/database/user-extra-fields";
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

const DEFAULT_HEAD_OFFICE_NAME = "Head Office";
const DEFAULT_HEAD_OFFICE_CODE = "HO-001";
const PUBLIC_DIRECTORY_CACHE_TTL_MS = 60_000;

@Injectable()
export class AuthService {
  private userExtraFieldAvailability?: Promise<UserExtraFieldAvailability>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cache: MemoryCacheService
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

    // 5. Aadhaar Verification (when Aadhaar is registered on the account)
    // If the user account has aadhaarNumber set, the caller MUST provide
    // aadhaarLast4 and it must match the last 4 digits of the stored number.
    if ((user as any).aadhaarNumber) {
      if (!dto.aadhaarLast4) {
        throw new UnauthorizedException("Aadhaar verification required: please enter the last 4 digits of your Aadhaar card");
      }
 
      const storedLast4 = (user as any).aadhaarNumber.slice(-4);
      if (dto.aadhaarLast4 !== storedLast4) {
        throw new UnauthorizedException("Aadhaar verification failed: the digits you entered do not match");
      }
    }

    // 6. Portal-Specific Access Enforcement
    // If logging in via the main Administrative portal, ensure the user is indeed a Society Admin.
    if (dto.portalSource === 'ADMIN') {
      const extras = await this.getUserExtraFields(user.id);
      
      // We check both the Prisma-fetched property and the manual extra fields query for maximum reliability
      const isSocietyAdmin = (user as any).isSocietyAdmin === true || extras.isSocietyAdmin === true;
      const isPlatformAdmin = user.role === UserRole.SUPER_ADMIN;

      if (!isSocietyAdmin && !isPlatformAdmin) {
        throw new UnauthorizedException("Institutional Access Denied: This portal is reserved for society administrators. Staff members must use their designated society staff login portal.");
      }
    }

    return this.buildLoginResponse(user);
  }

  async listActiveSocieties() {
    return this.cache.getOrSet("public:societies", PUBLIC_DIRECTORY_CACHE_TTL_MS, async () =>
      this.prisma.society.findMany({
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
      })
    );
  }

  async getPlatformStats() {
    return this.cache.getOrSet("public:platform_stats", PUBLIC_DIRECTORY_CACHE_TTL_MS, async () => {
      const [
        clients,
        agents,
        societyAdmins,
        platformAdmins,
        societies,
        totalAccounts,
        totalDeposits,
        totalLoans,
        totalTransactions
      ] = await Promise.all([
        this.prisma.user.count({ where: { role: UserRole.CLIENT } }),
        this.prisma.user.count({ where: { role: UserRole.AGENT } }),
        this.prisma.user.count({ where: { role: UserRole.SUPER_USER } }),
        this.prisma.user.count({ where: { role: UserRole.SUPER_ADMIN } }),
        this.prisma.society.count({ where: { isActive: true, status: SocietyStatus.ACTIVE } }),
        this.prisma.account.count({ where: { status: AccountStatus.ACTIVE } }),
        this.prisma.depositAccount.count(),
        this.prisma.loanAccount.count({ where: { status: { notIn: [LoanStatus.APPLIED, LoanStatus.CLOSED] } } }),
        this.prisma.transaction.count()
      ]);

      return {
        clients,
        agents,
        societyAdmins,
        platformAdmins,
        societies,
        totalAccounts,
        totalDeposits,
        totalLoans,
        totalTransactions
      };
    });
  }

  async listActiveSocietyBranches(societyCode: string) {
    const society = await this.findActiveSocietyByCode(societyCode);
    return this.cache.getOrSet(`public:branches:${society.id}`, PUBLIC_DIRECTORY_CACHE_TTL_MS, async () => {
      await this.ensureHeadOfficeBranch(this.prisma, society.id);

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
      const headOfficeBranch = await this.ensureHeadOfficeBranch(tx, society.id);
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
          branchId: headOfficeBranch.id,
          customerId: customer.id,
          requiresPasswordChange: true
        }
      });

      await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(UserRole.CLIENT));
      await this.createFreeSubscription(tx, user.id);
      await this.createProvisionedZeroBalanceAccount(tx, {
        societyId: society.id,
        customerId: customer.id,
        branchId: headOfficeBranch.id,
        role: UserRole.CLIENT
      });
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
      const societyCode = await this.resolveAvailableSocietyCode(dto.societyCode, dto.societyName);

      // Autogenerate username from society code if not provided or to ensure consistent naming
      const autoUsername = this.createInitialSocietyAdminUsername(dto.fullName, societyCode);
      const usernameToUse = dto.username?.trim() || autoUsername;

      const identity = this.normalizeIdentity(usernameToUse, dto.fullName);
      await this.assertUsernameAvailable(identity.username);
      const passwordHash = await hash(dto.password, 10);

      if (dto.aadhaarNumber) {
        const existingAadhaar = await this.prisma.user.findUnique({
          where: { aadhaarNumber: dto.aadhaarNumber }
        });
        if (existingAadhaar) {
          throw new UnauthorizedException("This Aadhaar number is already registered with another account");
        }
      }

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
        const headOfficeBranch = await this.ensureHeadOfficeBranch(tx, society.id);

        const user = await tx.user.create({
          data: {
            username: identity.username,
            passwordHash,
            fullName: identity.fullName,
            aadhaarNumber: dto.aadhaarNumber || null,
            role: UserRole.SUPER_USER,
            societyId: society.id,
            branchId: headOfficeBranch.id
          }
        });
        await this.updateUserAdminFlag(tx, user.id, true);

        await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(UserRole.SUPER_USER));
        
        const plan = dto.planId === "PREMIUM" ? SubscriptionPlan.PREMIUM : SubscriptionPlan.FREE;
        const monthlyPrice = plan === SubscriptionPlan.PREMIUM ? (Number(this.configService.get("PREMIUM_MONTHLY_PRICE") || "299")) : 0;

        await tx.subscription.create({
          data: {
            userId: user.id,
            plan,
            status: SubscriptionStatus.ACTIVE,
            monthlyPrice
          }
        });
        await ensureDefaultDepositSchemes(tx);

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

    const extras = await this.getUserExtraFields(user.id);

    return {
      ...this.buildUserProfile(user, extras),
      isActive: user.isActive,
      allowedModuleSlugs: await this.resolveUserAllowedModules(user.id, user.role)
    };
  }

  async updateMyProfile(
    currentUser: RequestUser,
    dto: {
      fullName?: string;
      avatarUrl?: string;
      phone?: string;
      email?: string;
      address?: string;
      fatherName?: string;
      motherName?: string;
      dateOfBirth?: string;
      gender?: string;
      panNumber?: string;
      nomineeFullName?: string;
      nomineeRelation?: string;
      nomineeContactNumber?: string;
    }
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      select: { id: true, customerId: true }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const userUpdate: Record<string, unknown> = {};
    if (dto.fullName?.trim()) {
      userUpdate.fullName = dto.fullName.trim();
    }
    if (dto.avatarUrl !== undefined) {
      userUpdate.avatarUrl = dto.avatarUrl || null;
    }

    if (Object.keys(userUpdate).length > 0) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: userUpdate
      });
    }

    // Update the linked Customer profile record if it exists
    if (user.customerId) {
      const customerUpdate: Record<string, unknown> = {};
      if (dto.phone !== undefined) customerUpdate.phone = dto.phone.trim() || null;
      if (dto.email !== undefined) customerUpdate.email = dto.email.trim() || null;
      if (dto.address !== undefined) customerUpdate.address = dto.address.trim() || null;
      if (dto.fatherName !== undefined) customerUpdate.fatherName = dto.fatherName.trim() || null;
      if (dto.motherName !== undefined) customerUpdate.motherName = dto.motherName.trim() || null;
      if (dto.dateOfBirth !== undefined) customerUpdate.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
      if (dto.gender !== undefined) customerUpdate.gender = dto.gender.trim() || null;
      if (dto.panNumber !== undefined) customerUpdate.panNumber = dto.panNumber.trim().toUpperCase() || null;
      if (dto.nomineeFullName !== undefined) customerUpdate.nomineeFullName = dto.nomineeFullName.trim() || null;
      if (dto.nomineeRelation !== undefined) customerUpdate.nomineeRelation = dto.nomineeRelation.trim() || null;
      if (dto.nomineeContactNumber !== undefined) customerUpdate.nomineeContactNumber = dto.nomineeContactNumber.trim() || null;

      if (Object.keys(customerUpdate).length > 0) {
        try {
          await this.prisma.customer.update({
            where: { id: user.customerId },
            data: customerUpdate
          });
        } catch {
          // Customer model may not have all fields — skip gracefully
        }
      }
    }

    return this.me(currentUser);
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

  private async resolveAvailableSocietyCode(rawSocietyCode: string | undefined, societyName: string) {
    const baseCode = this.buildSocietyCode(rawSocietyCode?.trim() || societyName);
    let candidate = baseCode;
    let sequence = 2;

    while (true) {
      const existingSociety = await this.prisma.society.findUnique({
        where: { code: candidate },
        select: {
          id: true
        }
      });

      if (!existingSociety) {
        return candidate;
      }

      candidate = `${baseCode.slice(0, 9)}-${sequence}`.replace(/-+$/, "");
      sequence += 1;
    }
  }

  private buildSocietyCode(value: string) {
    const normalized = value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return (normalized || "SOCIETY").slice(0, 12);
  }

  private async buildLoginResponse(user: UserProfileRecord) {
    const allowedModuleSlugs = await this.resolveUserAllowedModules(user.id, user.role);
    if (user.societyId) {
      await ensureDefaultDepositSchemes(this.prisma);
    }
    const extras = await this.getUserExtraFields(user.id);

    return {
      accessToken: this.signToken(this.toRequestUser(user, allowedModuleSlugs)),
      user: {
        ...this.buildUserProfile(user, extras),
        allowedModuleSlugs
      }
    };
  }

  private buildUserProfile(
    user: UserProfileRecord,
    extras: {
      aadhaarNumber: string | null;
      isSocietyAdmin: boolean;
    } = {
      aadhaarNumber: null,
      isSocietyAdmin: false
    }
  ) {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: (user as any).avatarUrl,
      aadhaarNumber: extras.aadhaarNumber,
      role: user.role,
      isSocietyAdmin: extras.isSocietyAdmin,
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

  private toRequestUser(
    user: Pick<UserProfileRecord, "id" | "username" | "role" | "societyId" | "customerId">,
    allowedModuleSlugs?: string[]
  ): RequestUser {
    return {
      sub: user.id,
      username: user.username,
      role: user.role,
      societyId: user.societyId ?? null,
      customerId: user.customerId ?? null,
      allowedModuleSlugs
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
      const headOfficeBranch = await this.ensureHeadOfficeBranch(tx, society.id);
      let customerId: string | undefined;

      if (role === UserRole.AGENT) {
        const { firstName, lastName } = this.splitFullName(identity.fullName);
        customerId = await this.createLinkedCustomerProfile(tx, {
          societyId: society.id,
          societyCode: society.code,
          role,
          firstName,
          lastName
        });
      }

      const user = await tx.user.create({
        data: {
          username: identity.username,
          passwordHash,
          fullName: identity.fullName,
          role,
          societyId: society.id,
          branchId: headOfficeBranch.id,
          customerId,
          requiresPasswordChange: true
        }
      });

      await this.updateAllowedModules(tx, user.id, getDefaultAllowedModules(role));
      await this.createFreeSubscription(tx, user.id);

      if (user.customerId) {
        await this.createProvisionedZeroBalanceAccount(tx, {
          societyId: society.id,
          customerId: user.customerId,
          branchId: headOfficeBranch.id,
          role
        });
      }

      return this.loadUserProfile(tx, user.id, errorMessage);
    });
  }

  private async createLinkedCustomerProfile(
    tx: Prisma.TransactionClient,
    input: {
      societyId: string;
      societyCode: string;
      role: UserRole;
      firstName: string;
      lastName?: string;
    }
  ) {
    const prefix = input.role === UserRole.AGENT ? "A" : "C";
    const count = await tx.customer.count({
      where: {
        societyId: input.societyId
      }
    });

    const customer = await tx.customer.create({
      data: {
        customerCode: `${input.societyCode}-${prefix}${String(count + 1).padStart(5, "0")}`,
        societyId: input.societyId,
        firstName: input.firstName,
        lastName: input.lastName
      },
      select: {
        id: true
      }
    });

    return customer.id;
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

  private async createProvisionedZeroBalanceAccount(
    tx: Prisma.TransactionClient,
    input: {
      societyId: string;
      customerId: string;
      branchId: string;
      role: UserRole;
    }
  ) {
    if (input.role !== UserRole.CLIENT && input.role !== UserRole.AGENT) {
      return;
    }

    const type = input.role === UserRole.AGENT ? AccountType.PIGMY : AccountType.SAVINGS;
    const existingAccount = await tx.account.findFirst({
      where: {
        customerId: input.customerId,
        type
      },
      select: {
        id: true
      }
    });

    if (existingAccount) {
      return;
    }

    const [branch, accountNumber] = await Promise.all([
      tx.branch.findUnique({
        where: { id: input.branchId },
        select: {
          code: true
        }
      }),
      this.generateProvisionedAccountNumber(tx, input.societyId, input.branchId, type)
    ]);

    await tx.account.create({
      data: {
        accountNumber,
        societyId: input.societyId,
        customerId: input.customerId,
        type,
        status: AccountStatus.ACTIVE,
        currentBalance: 0,
        branchId: input.branchId,
        branchCode: branch?.code ?? null,
        isPassbookEnabled: input.role === UserRole.CLIENT
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

  private async updateUserAdminFlag(tx: Prisma.TransactionClient | PrismaService, userId: string, isSocietyAdmin: boolean) {
    const { isSocietyAdmin: supportsSocietyAdmin } = await this.getUserExtraFieldAvailability();

    if (!supportsSocietyAdmin) {
      return;
    }

    await tx.$executeRaw`
      UPDATE "User"
      SET "isSocietyAdmin" = ${isSocietyAdmin}
      WHERE "id" = ${userId}
    `;
  }

  private async getUserExtraFields(userId: string) {
    const columnAvailability = await this.getUserExtraFieldAvailability();

    if (!columnAvailability.aadhaarNumber && !columnAvailability.isSocietyAdmin) {
      return { aadhaarNumber: null, isSocietyAdmin: false };
    }

    const aadhaarNumberSelect = columnAvailability.aadhaarNumber
      ? Prisma.sql`"aadhaarNumber" AS "aadhaarNumber"`
      : Prisma.sql`NULL::TEXT AS "aadhaarNumber"`;
    const societyAdminSelect = columnAvailability.isSocietyAdmin
      ? Prisma.sql`"isSocietyAdmin" AS "isSocietyAdmin"`
      : Prisma.sql`FALSE AS "isSocietyAdmin"`;
    const rows = await this.prisma.$queryRaw<Array<{ aadhaarNumber: string | null; isSocietyAdmin: boolean }>>(
      Prisma.sql`
        SELECT ${aadhaarNumberSelect}, ${societyAdminSelect}
        FROM "User"
        WHERE "id" = ${userId}
        LIMIT 1
      `
    );

    const rawRow = rows[0] ?? { aadhaarNumber: null, isSocietyAdmin: false };
    return {
      aadhaarNumber: rawRow.aadhaarNumber,
      isSocietyAdmin: rawRow.isSocietyAdmin === true || String(rawRow.isSocietyAdmin).toLowerCase() === 't' || String(rawRow.isSocietyAdmin) === '1'
    };
  }

  private getUserExtraFieldAvailability() {
    this.userExtraFieldAvailability ??= loadUserExtraFieldAvailability(this.prisma);

    return this.userExtraFieldAvailability;
  }

  private async ensureHeadOfficeBranch(tx: Prisma.TransactionClient | PrismaService, societyId: string) {
    const existingHeadOffice = await tx.branch.findFirst({
      where: {
        societyId,
        isHead: true
      },
      select: {
        id: true,
        isActive: true
      }
    });

    if (existingHeadOffice) {
      if (!existingHeadOffice.isActive) {
        await tx.branch.update({
          where: { id: existingHeadOffice.id },
          data: { isActive: true }
        });
      }

      await tx.user.updateMany({
        where: {
          societyId,
          branchId: null
        },
        data: {
          branchId: existingHeadOffice.id
        }
      });

      return {
        id: existingHeadOffice.id
      };
    }

    const existingBranch = await tx.branch.findFirst({
      where: { societyId },
      select: { id: true }
    });

    if (existingBranch) {
      await tx.branch.update({
        where: { id: existingBranch.id },
        data: {
          isHead: true,
          isActive: true
        }
      });

      await tx.user.updateMany({
        where: {
          societyId,
          branchId: null
        },
        data: {
          branchId: existingBranch.id
        }
      });

      return existingBranch;
    }

    const createdBranch = await tx.branch.create({
      data: {
        code: DEFAULT_HEAD_OFFICE_CODE,
        name: DEFAULT_HEAD_OFFICE_NAME,
        isHead: true,
        isActive: true,
        societyId
      },
      select: {
        id: true
      }
    });

    return createdBranch;
  }

  private splitFullName(fullName: string) {
    const [firstName, ...restName] = fullName.trim().split(/\s+/);
    return {
      firstName,
      lastName: restName.join(" ") || undefined
    };
  }

  private async generateProvisionedAccountNumber(
    tx: Prisma.TransactionClient | PrismaService,
    societyId: string,
    branchId: string,
    type: AccountType
  ) {
    const [society, branch, count] = await Promise.all([
      tx.society.findUnique({
        where: { id: societyId },
        select: {
          code: true
        }
      }),
      tx.branch.findUnique({
        where: { id: branchId },
        select: {
          code: true
        }
      }),
      tx.account.count({
        where: {
          societyId,
          type
        }
      })
    ]);

    const accountCodeByType: Record<AccountType, string> = {
      SAVINGS: "101",
      CURRENT: "102",
      FIXED_DEPOSIT: "201",
      RECURRING_DEPOSIT: "202",
      LOAN: "301",
      PIGMY: "401",
      GENERAL: "501"
    };

    const societyCode = (society?.code ?? "001").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padStart(3, "0");
    const branchCode = (branch?.code ?? "001").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padStart(3, "0");
    const sequence = String(count + 1).padStart(8, "0");

    return `${societyCode}${branchCode}${accountCodeByType[type]}${sequence}`;
  }
}
