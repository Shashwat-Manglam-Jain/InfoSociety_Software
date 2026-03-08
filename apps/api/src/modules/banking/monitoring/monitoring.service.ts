import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateSocietyDto } from "./dto/create-society.dto";

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  getModuleOverview() {
    return {
      module: "monitoring",
      description: "Society level monitoring, creation controls, and global KPIs.",
      workflows: [
        "Society onboarding",
        "Global and scoped portfolio monitoring",
        "Role distribution analytics",
        "Customer/account/transaction balance supervision"
      ]
    };
  }

  getWorkflows() {
    return this.getModuleOverview().workflows;
  }

  async createSociety(dto: CreateSocietyDto) {
    return this.prisma.society.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim()
      }
    });
  }

  async listSocieties(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_USER) {
      return this.prisma.society.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              users: true,
              customers: true,
              accounts: true
            }
          }
        }
      });
    }

    if (!currentUser.societyId) {
      throw new ForbiddenException("Agent is not mapped to a society");
    }

    return this.prisma.society.findMany({
      where: { id: currentUser.societyId },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            accounts: true
          }
        }
      }
    });
  }

  async getOverview(currentUser: RequestUser) {
    const societies = await this.listSocieties(currentUser);

    if (societies.length === 0) {
      throw new BadRequestException("No societies are available for this user");
    }

    const societiesWithMetrics = await Promise.all(
      societies.map(async (society) => {
        const [transactionCount, accountAggregate] = await Promise.all([
          this.prisma.transaction.count({ where: { account: { societyId: society.id } } }),
          this.prisma.account.aggregate({
            where: { societyId: society.id },
            _sum: { currentBalance: true }
          })
        ]);

        return {
          id: society.id,
          code: society.code,
          name: society.name,
          activeUsers: society._count.users,
          customers: society._count.customers,
          accounts: society._count.accounts,
          transactions: transactionCount,
          totalBalance: this.decimalToNumber(accountAggregate._sum.currentBalance)
        };
      })
    );

    const userRoleBreakdownRaw = await this.prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: currentUser.role === UserRole.SUPER_USER ? {} : { societyId: currentUser.societyId ?? "" }
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
        return accumulator;
      },
      {
        societies: 0,
        customers: 0,
        accounts: 0,
        transactions: 0,
        totalBalance: 0
      }
    );

    return {
      scope: currentUser.role === UserRole.SUPER_USER ? "all_societies" : "assigned_society",
      totals,
      userRoleBreakdown,
      societies: societiesWithMetrics
    };
  }

  private decimalToNumber(value: Prisma.Decimal | null): number {
    return value ? Number(value.toString()) : 0;
  }
}
