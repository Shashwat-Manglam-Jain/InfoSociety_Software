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
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
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

    return this.prisma.society.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        status: dto.status ?? SocietyStatus.ACTIVE,
        billingEmail: dto.billingEmail?.trim() || undefined,
        billingPhone: dto.billingPhone?.trim() || undefined,
        billingAddress: dto.billingAddress?.trim() || undefined,
        acceptsDigitalPayments: dto.acceptsDigitalPayments ?? false,
        upiId: dto.upiId?.trim() || undefined
      }
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

    return this.prisma.society.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.billingEmail !== undefined ? { billingEmail: dto.billingEmail.trim() } : {}),
        ...(dto.billingPhone !== undefined ? { billingPhone: dto.billingPhone.trim() } : {}),
        ...(dto.billingAddress !== undefined ? { billingAddress: dto.billingAddress.trim() } : {}),
        ...(dto.acceptsDigitalPayments !== undefined ? { acceptsDigitalPayments: dto.acceptsDigitalPayments } : {}),
        ...(dto.upiId !== undefined ? { upiId: dto.upiId.trim() } : {})
      }
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
      throw new BadRequestException("No societies are available for this user");
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
}
