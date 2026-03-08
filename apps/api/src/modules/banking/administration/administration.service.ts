import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TransactionType, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { ListWorkingDaysQueryDto } from "./dto/list-working-days-query.dto";
import { RecomputeAccountDto } from "./dto/recompute-account.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { WorkingDayDto } from "./dto/working-day.dto";

@Injectable()
export class AdministrationService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "administration",
      ...bankingFeatureMap["administration"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["administration"].workflows;
  }

  async listWorkingDays(query: ListWorkingDaysQueryDto) {
    const where: Prisma.WorkingDayWhereInput = {};

    if (query.from || query.to) {
      where.date = {};
      if (query.from) {
        where.date.gte = new Date(query.from);
      }
      if (query.to) {
        where.date.lte = new Date(query.to);
      }
    }

    const [rows, total] = await Promise.all([
      this.prisma.workingDay.findMany({
        where,
        include: {
          openedBy: {
            select: {
              username: true,
              fullName: true
            }
          },
          closedBy: {
            select: {
              username: true,
              fullName: true
            }
          }
        },
        orderBy: {
          date: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.workingDay.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async beginWorkingDay(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);

    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { date },
      update: {
        openedById: currentUser.sub,
        isDayEnd: false
      },
      create: {
        date,
        openedById: currentUser.sub
      }
    });
  }

  async dayEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);

    const date = this.toDayStart(dto.date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const cashbookFilter: Prisma.CashBookEntryWhereInput = {
      isPosted: false,
      entryDate: {
        gte: date,
        lt: dayEnd
      }
    };

    if (currentUser.role === UserRole.AGENT) {
      cashbookFilter.createdBy = {
        societyId: currentUser.societyId ?? ""
      };
    }

    const postedResult = await this.prisma.cashBookEntry.updateMany({
      where: cashbookFilter,
      data: {
        isPosted: true,
        postedAt: new Date()
      }
    });

    const workingDay = await this.prisma.workingDay.upsert({
      where: { date },
      update: {
        isDayEnd: true,
        closedById: currentUser.sub
      },
      create: {
        date,
        isDayEnd: true,
        openedById: currentUser.sub,
        closedById: currentUser.sub
      }
    });

    return {
      workingDay,
      autoPostedCashbookEntries: postedResult.count
    };
  }

  async monthEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { date },
      update: {
        isMonthEnd: true,
        closedById: currentUser.sub
      },
      create: {
        date,
        isMonthEnd: true,
        openedById: currentUser.sub,
        closedById: currentUser.sub
      }
    });
  }

  async yearEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { date },
      update: {
        isYearEnd: true,
        closedById: currentUser.sub
      },
      create: {
        date,
        isYearEnd: true,
        openedById: currentUser.sub,
        closedById: currentUser.sub
      }
    });
  }

  async listUsers(currentUser: RequestUser) {
    this.ensureOperator(currentUser);

    return this.prisma.user.findMany({
      where:
        currentUser.role === UserRole.SUPER_USER
          ? {}
          : {
              societyId: currentUser.societyId ?? ""
            },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        society: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async updateUserStatus(currentUser: RequestUser, id: string, dto: UpdateUserStatusDto) {
    this.ensureOperator(currentUser);

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        societyId: true,
        role: true
      }
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    if (currentUser.role === UserRole.AGENT) {
      if (target.role === UserRole.SUPER_USER || target.societyId !== currentUser.societyId) {
        throw new ForbiddenException("Agent cannot modify this user");
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: dto.isActive
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true
      }
    });
  }

  async recomputeAccountBalance(currentUser: RequestUser, accountId: string, dto: RecomputeAccountDto) {
    this.ensureOperator(currentUser);

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        societyId: true,
        accountNumber: true
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    if (currentUser.role === UserRole.AGENT && currentUser.societyId !== account.societyId) {
      throw new ForbiddenException("Account belongs to another society");
    }

    const transactionFilter: Prisma.TransactionWhereInput = {
      accountId,
      isPassed: true
    };

    if (dto.fromDate) {
      transactionFilter.valueDate = {
        gte: new Date(dto.fromDate)
      };
    }

    const [creditSum, debitSum] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          ...transactionFilter,
          type: TransactionType.CREDIT
        },
        _sum: {
          amount: true
        }
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...transactionFilter,
          type: TransactionType.DEBIT
        },
        _sum: {
          amount: true
        }
      })
    ]);

    const computedBalance = Number(creditSum._sum.amount ?? 0) - Number(debitSum._sum.amount ?? 0);

    await this.prisma.account.update({
      where: { id: accountId },
      data: {
        currentBalance: computedBalance
      }
    });

    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      recomputedBalance: computedBalance
    };
  }

  async recomputeGl(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const targetDate = dto.date ? new Date(dto.date) : new Date();

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const where: Prisma.CashBookEntryWhereInput = {
      entryDate: {
        gte: dayStart,
        lt: dayEnd
      },
      isPosted: true
    };

    if (currentUser.role === UserRole.AGENT) {
      where.createdBy = {
        societyId: currentUser.societyId ?? ""
      };
    }

    const entries = await this.prisma.cashBookEntry.findMany({
      where,
      select: {
        headCode: true,
        headName: true,
        amount: true,
        type: true
      }
    });

    const grouped = entries.reduce<Record<string, { headName: string; debit: number; credit: number }>>((acc, entry) => {
      if (!acc[entry.headCode]) {
        acc[entry.headCode] = { headName: entry.headName, debit: 0, credit: 0 };
      }

      if (entry.type === TransactionType.DEBIT) {
        acc[entry.headCode].debit += Number(entry.amount);
      } else {
        acc[entry.headCode].credit += Number(entry.amount);
      }

      return acc;
    }, {});

    return {
      date: dayStart.toISOString(),
      heads: grouped
    };
  }

  private ensureOperator(currentUser: RequestUser) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot access administration controls");
    }
  }

  private toDayStart(date?: string): Date {
    const output = date ? new Date(date) : new Date();
    output.setHours(0, 0, 0, 0);
    return output;
  }
}
