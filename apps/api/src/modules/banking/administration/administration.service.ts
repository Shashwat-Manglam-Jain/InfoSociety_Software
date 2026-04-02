import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TransactionType, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ListWorkingDaysQueryDto } from "./dto/list-working-days-query.dto";
import { MapAgentClientDto } from "./dto/map-agent-client.dto";
import { RecomputeAccountDto } from "./dto/recompute-account.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { WorkingDayDto } from "./dto/working-day.dto";

@Injectable()
export class AdministrationService {
  constructor(private readonly prisma: PrismaService) {}

  async mapAgentClient(currentUser: RequestUser, dto: MapAgentClientDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    // Verify both belong to the same society
    const [agent, client] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: dto.agentId }, select: { id: true, societyId: true } }),
      this.prisma.customer.findUnique({ where: { id: dto.customerId }, select: { id: true, societyId: true } })
    ]);

    if (!agent || !client) {
      throw new NotFoundException("Agent or Client profile not found");
    }

    if (agent.societyId !== societyId || client.societyId !== societyId) {
      throw new ForbiddenException("Customers must belong to your society");
    }

    return this.prisma.agentClient.create({
      data: {
        agentId: dto.agentId,
        customerId: dto.customerId,
        installmentAmount: dto.installmentAmount,
        depositUnits: dto.depositUnits,
        isActive: true
      }
    });
  }

  async listAgentMappings(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    return this.prisma.agentClient.findMany({
      where: {
        agent: {
          societyId
        }
      },
      include: {
        agent: { select: { firstName: true, lastName: true, customerCode: true } },
        customer: { select: { firstName: true, lastName: true, customerCode: true } }
      }
    });
  }

  async createBranch(currentUser: RequestUser, dto: CreateBranchDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    let branchCode = dto.code?.trim().toUpperCase();
    if (!branchCode) {
      const branchCount = await this.prisma.branch.count({ where: { societyId } });
      branchCode = `BR${String(branchCount + 1).padStart(3, "0")}`;
    }

    const existing = await this.prisma.branch.findUnique({
      where: {
        societyId_code: {
          societyId,
          code: branchCode
        }
      }
    });

    if (existing) {
      throw new ConflictException(`Branch code ${branchCode} already exists in this society`);
    }

    return this.prisma.branch.create({
      data: {
        ...dto,
        code: branchCode,
        societyId
      }
    });
  }

  async createUser(currentUser: RequestUser, dto: CreateUserDto & { branchId?: string }) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase() }
    });

    if (existing) {
      throw new ConflictException("Username already taken");
    }

    const passwordHash = await hash(dto.password, 10);

    let customerId: string | undefined;

    if (dto.role === UserRole.CLIENT) {
      const society = await this.prisma.society.findUnique({ where: { id: societyId } });
      if (!society) throw new NotFoundException("Society not found");
      
      const count = await this.prisma.customer.count({ where: { societyId } });
      const customerCode = `${society.code}-M${String(count + 1).padStart(5, "0")}`;
      
      const customer = await this.prisma.customer.create({
        data: {
          customerCode,
          societyId,
          firstName: dto.fullName.split(" ")[0],
          lastName: dto.fullName.split(" ").slice(1).join(" ") || undefined,
        }
      });
      customerId = customer.id;
    }

    return this.prisma.user.create({
      data: {
        username: dto.username.toLowerCase(),
        fullName: dto.fullName.trim(),
        passwordHash,
        role: dto.role,
        isActive: dto.isActive ?? true,
        societyId,
        branchId: dto.branchId,
        customerId
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true
      }
    });
  }

  async listBranches(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    return this.prisma.branch.findMany({
      where: { societyId }
    });
  }

  async listAgents(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    return this.prisma.customer.findMany({
      where: { 
        societyId,
        user: { role: UserRole.AGENT }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        customerCode: true
      }
    });
  }

  async getSocietyOverview(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    const [branchCount, staffCount, memberCount, totalDeposits] = await Promise.all([
      this.prisma.branch.count({ where: { societyId } }),
      this.prisma.user.count({ where: { societyId, role: { in: [UserRole.AGENT, UserRole.SUPER_USER] } } }),
      this.prisma.customer.count({ where: { societyId } }),
      this.prisma.account.aggregate({
        where: { societyId, type: { not: "LOAN" } },
        _sum: { currentBalance: true }
      })
    ]);

    return {
      totalBranches: branchCount,
      totalStaff: staffCount,
      totalMembers: memberCount,
      totalCapital: Number(totalDeposits._sum.currentBalance || 0)
    };
  }

  async updateSociety(currentUser: RequestUser, dto: any) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    return this.prisma.society.update({
      where: { id: societyId },
      data: {
        name: dto.name,
        billingEmail: dto.billingEmail,
        billingPhone: dto.billingPhone,
        billingAddress: dto.billingAddress,
        registrationNumber: dto.registrationNumber,
        panNo: dto.panNo,
        gstNo: dto.gstNo
      }
    });
  }

  async listSocietyTransactions(currentUser: RequestUser, query: any) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const where: any = { account: { societyId } };
    if (query.search) {
       where.OR = [
         { transactionNumber: { contains: query.search, mode: "insensitive" } },
         { account: { customer: { firstName: { contains: query.search, mode: "insensitive" } } } }
       ];
    }
    return this.prisma.transaction.findMany({
      where, take: 50, orderBy: { createdAt: "desc" },
      include: { account: { include: { customer: true } }, createdBy: true }
    });
  }

  async getAgentPerformance(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const agents = await this.prisma.customer.findMany({
       where: { societyId, user: { role: UserRole.AGENT } },
       include: { user: true }
    });

    const now = new Date();
    const startOfDay = new Date(now.setHours(0,0,0,0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return Promise.all(agents.map(async (agent) => {
       const [daily, weekly, monthly] = await Promise.all([
          this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: startOfDay } }, _sum: { amount: true } }),
          this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: startOfWeek } }, _sum: { amount: true } }),
          this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: startOfMonth } }, _sum: { amount: true } })
       ]);
       return {
          id: agent.id,
          name: `${agent.firstName} ${agent.lastName}`,
          code: agent.customerCode,
          daily: Number(daily._sum.amount || 0),
          weekly: Number(weekly._sum.amount || 0),
          monthly: Number(monthly._sum.amount || 0)
       };
    }));
  }

  async getAgentOverview(currentUser: RequestUser) {
    if (currentUser.role !== UserRole.AGENT) {
      throw new ForbiddenException("Only agents can access this overview");
    }
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const userId = currentUser.sub;

    // 1. Get Allotted Clients for this Agent
    // Need to find which Customer ID this User belongs to
    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { customerId: true }
    });

    if (!userProfile?.customerId) return { totalClients: 0, todayCollection: 0 };

    const mappedClientsCount = await this.prisma.agentClient.count({
      where: { agentId: userProfile.customerId, isActive: true }
    });

    // 2. Today's Collections (Transactions created by this user today)
    const today = this.toDayStart();
    const tonight = new Date(today);
    tonight.setDate(tonight.getDate() + 1);

    const collections = await this.prisma.transaction.aggregate({
      where: {
        createdById: userId,
        type: "CREDIT",
        isPassed: true,
        createdAt: { gte: today, lt: tonight }
      },
      _sum: { amount: true }
    });

    return {
      totalClients: mappedClientsCount,
      todayCollection: Number(collections._sum.amount || 0)
    };
  }

  getOverview() {
    return {
      module: "administration",
      ...bankingFeatureMap["administration"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["administration"].workflows;
  }

  async listWorkingDays(currentUser: RequestUser, query: ListWorkingDaysQueryDto) {
    this.ensureOperator(currentUser);

    const where: Prisma.WorkingDayWhereInput = {};

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      where.societyId = currentUser.societyId ?? "";
    }

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
          society: {
            select: {
              code: true,
              name: true
            }
          },
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

    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: {
        societyId_date: {
          societyId,
          date
        }
      },
      update: {
        openedById: currentUser.sub,
        isDayEnd: false
      },
      create: {
        societyId,
        date,
        openedById: currentUser.sub
      }
    });
  }

  async dayEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);

    const societyId = this.resolveOperatingSocietyId(currentUser);
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

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
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
      where: {
        societyId_date: {
          societyId,
          date
        }
      },
      update: {
        isDayEnd: true,
        closedById: currentUser.sub
      },
      create: {
        societyId,
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
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: {
        societyId_date: {
          societyId,
          date
        }
      },
      update: {
        isMonthEnd: true,
        closedById: currentUser.sub
      },
      create: {
        societyId,
        date,
        isMonthEnd: true,
        openedById: currentUser.sub,
        closedById: currentUser.sub
      }
    });
  }

  async yearEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: {
        societyId_date: {
          societyId,
          date
        }
      },
      update: {
        isYearEnd: true,
        closedById: currentUser.sub
      },
      create: {
        societyId,
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
        currentUser.role === UserRole.SUPER_ADMIN
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

    if (currentUser.role !== UserRole.SUPER_ADMIN && target.societyId !== currentUser.societyId) {
      throw new ForbiddenException("User belongs to another society");
    }

    if (target.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only platform administrators can modify superadmin users");
    }

    if (currentUser.role === UserRole.AGENT && target.role === UserRole.SUPER_USER) {
      throw new ForbiddenException("Agent cannot modify this user");
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

    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.societyId !== account.societyId) {
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

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
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

  async getCustomerDetails(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    return this.prisma.customer.findFirst({
      where: { id, societyId },
      include: {
        accounts: { include: { head: true } },
        agentClients: { include: { agent: { select: { firstName: true, lastName: true } } } },
        user: { select: { username: true, isActive: true } }
      }
    });
  }

  async getAgentDetails(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const agent = await this.prisma.customer.findFirst({
      where: { id, societyId, user: { role: UserRole.AGENT } },
      include: {
        user: true,
        pigmyClients: { include: { customer: true } }
      }
    });

    if (!agent) throw new NotFoundException("Agent not found");

    const [daily, monthly] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: this.toDayStart() } }, _sum: { amount: true } }),
      this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { amount: true } })
    ]);

    return {
      ...agent,
      performance: {
        daily: Number(daily._sum.amount || 0),
        monthly: Number(monthly._sum.amount || 0)
      }
    };
  }

  private ensureOperator(currentUser: RequestUser) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot access administration controls");
    }
  }

  private resolveOperatingSocietyId(currentUser: RequestUser) {
    if (!currentUser.societyId) {
      throw new ForbiddenException("Operator is not mapped to a society");
    }

    return currentUser.societyId;
  }

  private toDayStart(date?: string): Date {
    const output = date ? new Date(date) : new Date();
    output.setHours(0, 0, 0, 0);
    return output;
  }
}
