import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import {
  PaymentRequestStatus,
  PaymentTransactionStatus,
  Prisma,
  SocietyStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";
import { hash } from "bcryptjs";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { updateUserAllowedModules } from "../../../common/database/user-module-access";
import { getDefaultAllowedModules } from "../shared/module-access";
import { CreateSocietyDto } from "./dto/create-society.dto";
import { UpdateSocietyAccessDto } from "./dto/update-society-access.dto";

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  getModuleOverview() {
    return {
      module: "monitoring",
      description: "Platform and society monitoring, onboarding controls, subscription visibility, and digital collection readiness.",
      workflows: [
        "Society onboarding and approval",
        "Platform-level and scoped portfolio monitoring",
        "Role distribution analytics",
        "Subscription and digital payments supervision"
      ]
    };
  }

  getWorkflows() {
    return this.getModuleOverview().workflows;
  }

  async createSociety(dto: CreateSocietyDto, currentUser: RequestUser) {
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only platform superadmin can onboard a new society");
    }

    const code = dto.code.trim().toUpperCase();
    const name = dto.name.trim();
    const status = dto.status ?? SocietyStatus.PENDING;
    const isActive = status === SocietyStatus.ACTIVE;
    const temporaryPassword = "admin123";
    const username = `superadmin_${code.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
    const passwordHash = await hash(temporaryPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const society = await tx.society.create({
        data: {
          code,
          name,
          status,
          isActive,
          billingEmail: dto.billingEmail?.trim() || undefined,
          billingPhone: dto.billingPhone?.trim() || undefined,
          billingAddress: dto.billingAddress?.trim() || undefined,
          acceptsDigitalPayments: dto.acceptsDigitalPayments ?? false,
          upiId: dto.upiId?.trim() || undefined
        }
      });

      const superAdmin = await tx.user.create({
        data: {
          username,
          passwordHash,
          fullName: `${name} Superadmin`,
          role: UserRole.SUPER_USER,
          societyId: society.id,
          requiresPasswordChange: true
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          requiresPasswordChange: true
        }
      });

      await this.updateAllowedModules(tx, superAdmin.id, getDefaultAllowedModules(UserRole.SUPER_USER));

      return {
        ...society,
        superAdmin: {
          ...superAdmin,
          temporaryPassword,
          loginSocietyCode: society.code
        }
      };
    });
  }

  async updateSocietyAccess(id: string, dto: UpdateSocietyAccessDto, currentUser: RequestUser) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      select: {
        id: true,
        code: true
      }
    });

    if (!society) {
      throw new BadRequestException("Society not found");
    }

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const isSocietyAdmin = currentUser.role === UserRole.SUPER_USER && currentUser.societyId === id;

    if (!isSuperAdmin && !isSocietyAdmin) {
      throw new ForbiddenException("You cannot manage this society");
    }

    if (!isSuperAdmin && (dto.status !== undefined || dto.isActive !== undefined)) {
      throw new ForbiddenException("Only platform superadmin can approve or suspend a society");
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedSociety = await tx.society.update({
        where: { id },
        data: {
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.billingEmail !== undefined ? { billingEmail: dto.billingEmail == null ? null : dto.billingEmail.trim() } : {}),
          ...(dto.billingPhone !== undefined ? { billingPhone: dto.billingPhone == null ? null : dto.billingPhone.trim() } : {}),
          ...(dto.billingAddress !== undefined ? { billingAddress: dto.billingAddress == null ? null : dto.billingAddress.trim() } : {}),
          ...(dto.acceptsDigitalPayments !== undefined ? { acceptsDigitalPayments: dto.acceptsDigitalPayments } : {}),
          ...(dto.upiId !== undefined ? { upiId: dto.upiId == null ? null : dto.upiId.trim() } : {}),
          ...(dto.panNo !== undefined ? { panNo: dto.panNo == null ? null : dto.panNo.trim().toUpperCase() } : {}),
          ...(dto.tanNo !== undefined ? { tanNo: dto.tanNo == null ? null : dto.tanNo.trim().toUpperCase() } : {}),
          ...(dto.gstNo !== undefined ? { gstNo: dto.gstNo == null ? null : dto.gstNo.trim().toUpperCase() } : {}),
          ...(dto.category !== undefined ? { category: dto.category == null ? null : dto.category.trim() } : {}),
          ...(dto.authorizedCapital !== undefined ? { authorizedCapital: dto.authorizedCapital ?? null } : {}),
          ...(dto.paidUpCapital !== undefined ? { paidUpCapital: dto.paidUpCapital ?? null } : {}),
          ...(dto.shareNominalValue !== undefined ? { shareNominalValue: dto.shareNominalValue ?? null } : {}),
          ...(dto.registrationDate !== undefined ? { registrationDate: dto.registrationDate == null ? null : new Date(dto.registrationDate) } : {}),
          ...(dto.registrationNumber !== undefined ? { registrationNumber: dto.registrationNumber == null ? null : dto.registrationNumber.trim() } : {}),
          ...(dto.registrationState !== undefined ? { registrationState: dto.registrationState == null ? null : dto.registrationState.trim() } : {}),
          ...(dto.registrationAuthority !== undefined
            ? { registrationAuthority: dto.registrationAuthority == null ? null : dto.registrationAuthority.trim() }
            : {})
        },
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          isActive: true,
          acceptsDigitalPayments: true,
          upiId: true
        }
      });

      const provisionedSuperAdmin =
        isSuperAdmin && updatedSociety.status === SocietyStatus.ACTIVE && updatedSociety.isActive
          ? await this.ensureSocietySuperAdmin(tx, updatedSociety)
          : null;

      return {
        ...updatedSociety,
        provisionedSuperAdmin
      };
    });
  }

  async listSocieties(currentUser: RequestUser) {
    const isPlatformSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

    if (isPlatformSuperAdmin) {
      return this.prisma.society.findMany({
        orderBy: { name: "asc" },
        include: {
          subscription: true,
          _count: {
            select: {
              users: true,
              customers: true,
              accounts: true,
              paymentRequests: true,
              paymentTransactions: true
            }
          }
        }
      });
    }

    if (!currentUser.societyId) {
      throw new ForbiddenException("User is not mapped to a society");
    }

    return this.prisma.society.findMany({
      where: { id: currentUser.societyId },
      include: {
        subscription: true,
        _count: {
          select: {
            users: true,
            customers: true,
            accounts: true,
            paymentRequests: true,
            paymentTransactions: true
          }
        }
      }
    });
  }

  async getOverview(currentUser: RequestUser) {
    const isPlatformSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const societies = await this.listSocieties(currentUser);

    if (societies.length === 0) {
      return {
        scope: isPlatformSuperAdmin ? "platform" : "assigned_society",
        totals: {
          societies: 0,
          customers: 0,
          accounts: 0,
          transactions: 0,
          totalBalance: 0,
          successfulPaymentVolume: 0
        },
        userRoleBreakdown: {},
        societies: []
      };
    }

    const societiesWithMetrics = await Promise.all(
      societies.map(async (society) => {
        const [transactionCount, accountAggregate, successfulPaymentAggregate, openPaymentRequests] = await Promise.all([
          this.prisma.transaction.count({ where: { account: { societyId: society.id } } }),
          this.prisma.account.aggregate({
            where: { societyId: society.id },
            _sum: { currentBalance: true }
          }),
          this.prisma.paymentTransaction.aggregate({
            where: { societyId: society.id, status: PaymentTransactionStatus.SUCCESS },
            _sum: { amount: true }
          }),
          this.prisma.paymentRequest.count({
            where: { societyId: society.id, status: PaymentRequestStatus.OPEN }
          })
        ]);

        return {
          id: society.id,
          code: society.code,
          name: society.name,
          status: society.status,
          isActive: society.isActive,
          billingEmail: society.billingEmail,
          billingPhone: society.billingPhone,
          billingAddress: society.billingAddress,
          upiId: society.upiId,
          category: society.category,
          registrationState: society.registrationState,
          registrationNumber: society.registrationNumber,
          registrationAuthority: society.registrationAuthority,
          activeUsers: society._count.users,
          customers: society._count.customers,
          accounts: society._count.accounts,
          transactions: transactionCount,
          totalBalance: this.decimalToNumber(accountAggregate._sum.currentBalance),
          subscriptionPlan: society.subscription?.plan ?? SubscriptionPlan.FREE,
          subscriptionStatus: society.subscription?.status ?? SubscriptionStatus.ACTIVE,
          acceptsDigitalPayments: society.acceptsDigitalPayments,
          pendingPaymentRequests: openPaymentRequests,
          successfulPaymentVolume: this.decimalToNumber(successfulPaymentAggregate._sum.amount)
        };
      })
    );

    const userRoleBreakdownRaw = await this.prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: isPlatformSuperAdmin ? {} : { societyId: currentUser.societyId ?? "" }
    });

    const userRoleBreakdown = userRoleBreakdownRaw.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.role] = item._count.role;
      return accumulator;
    }, {});

    const totals = societiesWithMetrics.reduce(
      (accumulator, society) => {
        accumulator.societies += 1;
        accumulator.customers += society.customers;
        accumulator.accounts += society.accounts;
        accumulator.transactions += society.transactions;
        accumulator.totalBalance += society.totalBalance;
        accumulator.successfulPaymentVolume += society.successfulPaymentVolume;
        return accumulator;
      },
      {
        societies: 0,
        customers: 0,
        accounts: 0,
        transactions: 0,
        totalBalance: 0,
        successfulPaymentVolume: 0
      }
    );

    return {
      scope: isPlatformSuperAdmin ? "platform" : "assigned_society",
      totals,
      userRoleBreakdown,
      societies: societiesWithMetrics
    };
  }

  private decimalToNumber(value: Prisma.Decimal | null): number {
    return value ? Number(value.toString()) : 0;
  }

  private async ensureSocietySuperAdmin(
    tx: Prisma.TransactionClient,
    society: {
      id: string;
      code: string;
      name: string;
    }
  ) {
    const existingSuperAdmin = await tx.user.findFirst({
      where: {
        societyId: society.id,
        role: UserRole.SUPER_USER
      },
      select: {
        id: true,
        username: true
      }
    });

    if (existingSuperAdmin) {
      return null;
    }

    const temporaryPassword = "admin123";
    const username = await this.reserveSocietyAdminUsername(tx, society.code);
    const passwordHash = await hash(temporaryPassword, 10);
    const createdUser = await tx.user.create({
      data: {
        username,
        passwordHash,
        fullName: `${society.name} Administrator`,
        role: UserRole.SUPER_USER,
        societyId: society.id,
        isActive: true,
        requiresPasswordChange: true
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        requiresPasswordChange: true
      }
    });

    await this.updateAllowedModules(tx, createdUser.id, getDefaultAllowedModules(UserRole.SUPER_USER));

    return {
      ...createdUser,
      temporaryPassword,
      loginSocietyCode: society.code
    };
  }

  private async reserveSocietyAdminUsername(tx: Prisma.TransactionClient, societyCode: string) {
    const base = `adm_${societyCode.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
    let attempt = 0;

    while (attempt < 50) {
      const candidate = attempt === 0 ? base : `${base}_${attempt + 1}`;
      const existingUser = await tx.user.findFirst({
        where: {
          username: {
            equals: candidate,
            mode: "insensitive"
          }
        },
        select: {
          id: true
        }
      });

      if (!existingUser) {
        return candidate;
      }

      attempt += 1;
    }

    return `${base}_${Date.now().toString().slice(-6)}`;
  }

  private async updateAllowedModules(tx: Prisma.TransactionClient | PrismaService, userId: string, allowedModuleSlugs: string[]) {
    await updateUserAllowedModules(tx, userId, allowedModuleSlugs);
  }
}
