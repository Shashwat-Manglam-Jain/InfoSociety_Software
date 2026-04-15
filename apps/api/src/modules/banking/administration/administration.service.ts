import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountStatus, AccountType, Prisma, SubscriptionPlan, SubscriptionStatus, TransactionType, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { getDefaultAllowedModules, sanitizeAllowedModules } from "../shared/module-access";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { UserExtraFieldAvailability, loadUserExtraFieldAvailability } from "../../../common/database/user-extra-fields";
import { getUserAllowedModuleMap, updateUserAllowedModules } from "../../../common/database/user-module-access";
import { isCashPaymentMethod } from "../../shared/payment-methods";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ListWorkingDaysQueryDto } from "./dto/list-working-days-query.dto";
import { MapAgentClientDto } from "./dto/map-agent-client.dto";
import { RecomputeAccountDto } from "./dto/recompute-account.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { WorkingDayDto } from "./dto/working-day.dto";

const DEFAULT_HEAD_OFFICE_NAME = "Head Office";
const DEFAULT_HEAD_OFFICE_CODE = "HO-001";

@Injectable()
export class AdministrationService {
  private userExtraFieldAvailability?: Promise<UserExtraFieldAvailability>;

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
      branchCode = String(branchCount + 1).padStart(5, "0");
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

    const { id: _id, societyId: _sid, ...rest } = dto as any;

    return this.prisma.$transaction(async (tx) => {
      if (dto.isHead) {
        await tx.branch.updateMany({
          where: {
            societyId,
            isHead: true
          },
          data: {
            isHead: false
          }
        });
      }

      return tx.branch.create({
        data: {
          ...rest,
          openingDate: dto.openingDate ? new Date(dto.openingDate) : undefined,
          code: branchCode,
          societyId
        }
      });
    });
  }

  async updateBranch(currentUser: RequestUser, id: string, dto: any) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        id,
        societyId
      },
      select: {
        id: true,
        isHead: true
      }
    });

    if (!existingBranch) {
      throw new NotFoundException("Branch not found");
    }

    if (existingBranch.isHead && dto.isActive === false) {
      throw new ForbiddenException("Head office cannot be disabled");
    }

    const { id: _id, societyId: _sid, ...rest } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (dto.isHead) {
        await tx.branch.updateMany({
          where: {
            societyId,
            isHead: true,
            id: {
              not: id
            }
          },
          data: {
            isHead: false
          }
        });
      }

      return tx.branch.update({
        where: { id },
        data: {
          ...rest,
          openingDate: dto.openingDate ? new Date(dto.openingDate) : undefined,
        }
      });
    });
  }

  async deleteBranch(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const targetBranch = await this.prisma.branch.findFirst({
      where: {
        id,
        societyId
      },
      select: {
        id: true,
        isHead: true,
        isActive: true
      }
    });

    if (!targetBranch) {
      throw new NotFoundException("Branch not found");
    }

    if (targetBranch.isHead) {
      throw new ForbiddenException("Head office cannot be disabled");
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }

  async createUser(currentUser: RequestUser, dto: CreateUserDto & { branchId?: string }) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const normalizedUsername = this.normalizeUsername(dto.username);
    const normalizedAadhaarNumber = this.normalizeAadhaarNumber(dto.aadhaarNumber);

    if (currentUser.role === UserRole.AGENT && dto.role !== UserRole.CLIENT) {
      throw new ForbiddenException("Agents can provision client identities only");
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername }
    });

    if (existing) {
      throw new ConflictException("Username already taken");
    }

    await this.assertAadhaarAvailable(normalizedAadhaarNumber);

    const society = await this.prisma.society.findUnique({
      where: { id: societyId },
      select: { id: true, code: true }
    });

    if (!society) {
      throw new NotFoundException("Society not found");
    }

    const passwordHash = await hash(dto.password, 10);
    const allowedModuleSlugs = sanitizeAllowedModules(dto.role, dto.allowedModuleSlugs);
    const normalizedFullName = this.buildProvisionedFullName(dto.role, normalizedAadhaarNumber);
    const { firstName, lastName } = this.splitFullName(normalizedFullName);
    const needsCustomerProfile = dto.role === UserRole.CLIENT || dto.role === UserRole.AGENT;
    const targetBranchId = await this.resolveManagedUserBranchId(societyId, dto.branchId);

    return this.prisma.$transaction(async (tx) => {
      let customerId: string | undefined;

      if (needsCustomerProfile) {
        customerId = await this.createLinkedCustomerProfile(tx, {
          societyId,
          societyCode: society.code,
          role: dto.role,
          firstName,
          lastName,
          aadhaarNumber: normalizedAadhaarNumber
        });
      }

      const user = await tx.user.create({
        data: {
          username: normalizedUsername,
          fullName: normalizedFullName,
          passwordHash,
          role: dto.role,
          isActive: dto.isActive ?? true,
          societyId,
          branchId: targetBranchId,
          customerId,
          requiresPasswordChange: true
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
          branchId: true,
          customerId: true,
          requiresPasswordChange: true
        }
      });
      await this.updateUserAadhaarNumber(tx, user.id, normalizedAadhaarNumber);
      await this.updateUserAdminFlag(tx, user.id, false);

      await this.updateAllowedModules(tx, user.id, allowedModuleSlugs);

      if (customerId) {
        await this.createProvisionedZeroBalanceAccount(tx, {
          societyId,
          customerId,
          branchId: user.branchId ?? targetBranchId ?? null,
          role: dto.role
        });
      }

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: 0
        }
      });

      return user;
    });
  }

  async listBranches(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    await this.ensureHeadOfficeBranch(this.prisma, societyId);
    return this.prisma.branch.findMany({
      where: { societyId },
      orderBy: [
        { isHead: "desc" },
        { name: "asc" }
      ]
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

  async getSocietyOverview(currentUser: RequestUser, branchId?: string) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    const baseWhere: any = { societyId };
    if (branchId) {
      baseWhere.branchId = branchId;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      branchCount,
      staffCount,
      memberCount,
      totalDeposits,
      bankBalance,
      cashBalance,
      totalDistributed,
      totalInterest,
      collectionApproved,
      collectionPending,
      distributedApproved,
      distributedPending,
      totalCollected
    ] = await Promise.all([
      this.prisma.branch.count({ where: { societyId } }),
      this.prisma.user.count({
        where: {
          societyId,
          role: { in: [UserRole.AGENT, UserRole.SUPER_USER] },
          ...(branchId ? { branchId } : {})
        }
      }),
      branchId
        ? this.prisma.user.count({
            where: {
              societyId,
              role: UserRole.CLIENT,
              branchId
            }
          })
        : this.prisma.customer.count({
            where: {
              societyId,
              OR: [{ user: null }, { user: { role: UserRole.CLIENT } }]
            }
          }),
      
      this.prisma.account.aggregate({
        where: { ...baseWhere, type: { not: "LOAN" } },
        _sum: { currentBalance: true }
      }),

      this.prisma.account.aggregate({
        where: { ...baseWhere, type: { in: ["SAVINGS", "CURRENT"] }, head: { name: { contains: "Bank", mode: "insensitive" } } },
        _sum: { currentBalance: true }
      }),

      this.prisma.account.aggregate({
        where: { ...baseWhere, head: { name: { contains: "Cash", mode: "insensitive" } } },
        _sum: { currentBalance: true }
      }),

      this.prisma.loanAccount.aggregate({
        where: { account: baseWhere },
        _sum: { disbursedAmount: true }
      }),

      this.prisma.ledgerEntry.aggregate({
        where: { account: baseWhere },
        _sum: { interestReceivable: true, interestPayable: true }
      }),

      Promise.all([
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: true, valueDate: { gte: startOfToday } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: true, valueDate: { gte: startOfWeek } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: true, valueDate: { gte: startOfMonth } }, _sum: { amount: true } })
      ]),

      Promise.all([
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: false, valueDate: { gte: startOfToday } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: false, valueDate: { gte: startOfWeek } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: false, valueDate: { gte: startOfMonth } }, _sum: { amount: true } })
      ]),

      Promise.all([
        this.prisma.transaction.aggregate({ where: { account: { ...baseWhere, type: "LOAN" }, type: "DEBIT", isPassed: true, valueDate: { gte: startOfToday } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: { ...baseWhere, type: "LOAN" }, type: "DEBIT", isPassed: true, valueDate: { gte: startOfWeek } }, _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ where: { account: { ...baseWhere, type: "LOAN" }, type: "DEBIT", isPassed: true, valueDate: { gte: startOfMonth } }, _sum: { amount: true } })
      ]),

      Promise.all([
        this.prisma.loanAccount.aggregate({ where: { account: baseWhere, status: { in: ["APPLIED", "SANCTIONED"] }, createdAt: { gte: startOfToday } }, _sum: { applicationAmount: true } }),
        this.prisma.loanAccount.aggregate({ where: { account: baseWhere, status: { in: ["APPLIED", "SANCTIONED"] }, createdAt: { gte: startOfWeek } }, _sum: { applicationAmount: true } }),
        this.prisma.loanAccount.aggregate({ where: { account: baseWhere, status: { in: ["APPLIED", "SANCTIONED"] }, createdAt: { gte: startOfMonth } }, _sum: { applicationAmount: true } })
      ]),

      this.prisma.transaction.aggregate({ where: { account: baseWhere, type: "CREDIT", isPassed: true }, _sum: { amount: true } })
    ]);

    return {
      totalBranches: branchCount,
      totalStaff: staffCount,
      totalMembers: memberCount,
      totalCapital: Number(totalDeposits._sum.currentBalance || 0),
      bankBalance: Number(bankBalance._sum.currentBalance || 0),
      cashBalance: Number(cashBalance._sum.currentBalance || 0),
      totalDistributed: Number(totalDistributed._sum.disbursedAmount || 0),
      totalInterest: Number(totalInterest._sum.interestReceivable || 0) + Number(totalInterest._sum.interestPayable || 0),
      collectionApproved: {
        daily: Number(collectionApproved[0]._sum.amount || 0),
        weekly: Number(collectionApproved[1]._sum.amount || 0),
        monthly: Number(collectionApproved[2]._sum.amount || 0)
      },
      collectionPending: {
        daily: Number(collectionPending[0]._sum.amount || 0),
        weekly: Number(collectionPending[1]._sum.amount || 0),
        monthly: Number(collectionPending[2]._sum.amount || 0)
      },
      distributedApproved: {
        daily: Number(distributedApproved[0]._sum.amount || 0),
        weekly: Number(distributedApproved[1]._sum.amount || 0),
        monthly: Number(distributedApproved[2]._sum.amount || 0)
      },
      distributedPending: {
        daily: Number(distributedPending[0]._sum.applicationAmount || 0),
        weekly: Number(distributedPending[1]._sum.applicationAmount || 0),
        monthly: Number(distributedPending[2]._sum.applicationAmount || 0)
      },
      totalCollected: Number(totalCollected._sum.amount || 0)
    };
  }

  async updateSociety(currentUser: RequestUser, dto: any) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);

    const normalizeText = (value: unknown): string | null | undefined => {
      if (value === undefined) return undefined;
      if (typeof value !== "string") return value == null ? null : String(value);
      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    };

    const normalizeNumber = (value: unknown) => {
      if (value === undefined) return undefined;
      if (value === "" || value == null) return null;
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

    return this.prisma.society.update({
      where: { id: societyId },
      data: {
        name: normalizeText(dto.name) ?? undefined,
        billingEmail: normalizeText(dto.billingEmail),
        billingPhone: normalizeText(dto.billingPhone),
        billingAddress: normalizeText(dto.billingAddress),
        registrationNumber: normalizeText(dto.registrationNumber),
        panNo: typeof dto.panNo === "string" ? normalizeText(dto.panNo)?.toUpperCase() ?? null : normalizeText(dto.panNo),
        gstNo: typeof dto.gstNo === "string" ? normalizeText(dto.gstNo)?.toUpperCase() ?? null : normalizeText(dto.gstNo),
        logoUrl: normalizeText(dto.logoUrl),
        faviconUrl: normalizeText(dto.faviconUrl),
        about: normalizeText(dto.about),
        softwareUrl: normalizeText(dto.softwareUrl),
        cin: normalizeText(dto.cin),
        class: normalizeText(dto.class),
        authorizedCapital: normalizeNumber(dto.authorizedCapital),
        paidUpCapital: normalizeNumber(dto.paidUpCapital),
        shareNominalValue: normalizeNumber(dto.shareNominalValue),
        registrationState: normalizeText(dto.registrationState),
        category: normalizeText(dto.category),
        registrationDate: dto.registrationDate === undefined ? undefined : dto.registrationDate ? new Date(dto.registrationDate) : null,
      }
    });
  }

  async listSocietyTransactions(currentUser: RequestUser, query: any) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const search = query.search?.trim().toLowerCase() ?? "";

    const [transactions, cashbookEntries, paymentTransactions, loans, cheques, lockerVisits] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          account: {
            societyId
          }
        },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              branchId: true,
              branchCode: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  customerCode: true
                }
              }
            }
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
              branchId: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 120
      }),
      this.prisma.cashBookEntry.findMany({
        where: {
          createdBy: {
            societyId
          }
        },
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
              branchId: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 80
      }),
      this.prisma.paymentTransaction.findMany({
        where: {
          societyId
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              customerCode: true
            }
          },
          initiatedBy: {
            select: {
              id: true,
              username: true,
              fullName: true,
              branchId: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 80
      }),
      this.prisma.loanAccount.findMany({
        where: {
          account: {
            societyId
          }
        },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              branchId: true,
              branchCode: true
            }
          },
          customer: {
            select: {
              firstName: true,
              lastName: true,
              customerCode: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 80
      }),
      this.prisma.chequeClearing.findMany({
        where: {
          account: {
            societyId
          }
        },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              branchId: true,
              branchCode: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  customerCode: true
                }
              }
            }
          }
        },
        orderBy: {
          entryDate: "desc"
        },
        take: 80
      }),
      this.prisma.lockerVisit.findMany({
        where: {
          locker: {
            customer: {
              societyId
            }
          }
        },
        include: {
          locker: {
            select: {
              lockerNumber: true,
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  customerCode: true
                }
              }
            }
          }
        },
        orderBy: {
          visitedAt: "desc"
        },
        take: 60
      })
    ]);

    const activityRows = [
      ...transactions.map((transaction) => ({
        id: transaction.id,
        valueDate: transaction.valueDate,
        transactionNumber: transaction.transactionNumber,
        amount: Number(transaction.amount),
        type: transaction.type,
        mode: transaction.mode,
        remark: transaction.remark,
        isPassed: transaction.isPassed,
        status: transaction.isPassed ? "PASSED" : "PENDING",
        sourceModule: "transactions",
        sourceAction: transaction.type === TransactionType.CREDIT ? "Credit entry" : "Debit entry",
        account: {
          id: transaction.account.id,
          accountNumber: transaction.account.accountNumber,
          branchId: transaction.account.branchId,
          branchCode: transaction.account.branchCode,
          customer: transaction.account.customer
        },
        createdBy: transaction.createdBy
      })),
      ...cashbookEntries.map((entry) => ({
        id: entry.id,
        valueDate: entry.entryDate,
        transactionNumber: `${entry.headCode}-${entry.id.slice(0, 6).toUpperCase()}`,
        amount: Number(entry.amount),
        type: entry.type,
        mode: entry.mode,
        remark: entry.remark ?? entry.headName,
        isPassed: entry.isPosted,
        status: entry.isPosted ? "POSTED" : "PENDING",
        sourceModule: "cashbook",
        sourceAction: `Cashbook ${entry.type.toLowerCase()}`,
        account: {
          id: null,
          accountNumber: entry.headCode,
          branchId: entry.createdBy?.branchId ?? null,
          branchCode: null,
          customer: null
        },
        createdBy: entry.createdBy
      })),
      ...paymentTransactions.map((entry) => ({
        id: entry.id,
        valueDate: entry.processedAt ?? entry.createdAt,
        transactionNumber: entry.gatewayReference,
        amount: Number(entry.amount),
        type: isCashPaymentMethod(entry.method) ? TransactionType.CREDIT : null,
        mode: entry.method,
        remark: entry.remark,
        isPassed: entry.status === "SUCCESS",
        status: entry.status,
        sourceModule: "payments",
        sourceAction: isCashPaymentMethod(entry.method) ? "Cash collection" : "Payment received",
        account: {
          id: null,
          accountNumber: "-",
          branchId: entry.initiatedBy?.branchId ?? null,
          branchCode: null,
          customer: entry.customer
        },
        createdBy: entry.initiatedBy
      })),
      ...loans.map((loan) => ({
        id: loan.id,
        valueDate: loan.updatedAt,
        transactionNumber: loan.account.accountNumber,
        amount: Number(loan.disbursedAmount ?? loan.sanctionedAmount ?? loan.applicationAmount),
        type: loan.status === "DISBURSED" ? TransactionType.DEBIT : null,
        mode: "LOAN",
        remark: loan.remarks,
        isPassed: loan.status !== "APPLIED",
        status: loan.status,
        sourceModule: "loans",
        sourceAction:
          loan.status === "SANCTIONED"
            ? "Loan sanctioned"
            : loan.status === "DISBURSED"
              ? "Loan disbursed"
              : loan.status === "CLOSED"
                ? "Loan closed"
                : loan.status === "OVERDUE"
                  ? "Loan overdue"
                  : "Loan applied",
        account: {
          id: loan.account.id,
          accountNumber: loan.account.accountNumber,
          branchId: loan.account.branchId,
          branchCode: loan.account.branchCode,
          customer: loan.customer
        },
        createdBy: null
      })),
      ...cheques.map((entry) => ({
        id: entry.id,
        valueDate: entry.clearedDate ?? entry.entryDate,
        transactionNumber: entry.chequeNumber,
        amount: Number(entry.amount),
        type: entry.status === "CLEARED" ? TransactionType.CREDIT : entry.status === "RETURNED" ? TransactionType.DEBIT : null,
        mode: "CHEQUE",
        remark: `${entry.bankName} / ${entry.branchName}`,
        isPassed: entry.status !== "ENTERED",
        status: entry.status,
        sourceModule: "cheque-clearing",
        sourceAction: entry.status === "RETURNED" ? "Cheque rejected" : entry.status === "CLEARED" ? "Cheque approved" : "Cheque entered",
        account: {
          id: entry.account?.id ?? null,
          accountNumber: entry.account?.accountNumber ?? "-",
          branchId: entry.account?.branchId ?? null,
          branchCode: entry.account?.branchCode ?? null,
          customer: entry.account?.customer ?? null
        },
        createdBy: null
      })),
      ...lockerVisits.map((visit) => ({
        id: visit.id,
        valueDate: visit.visitedAt,
        transactionNumber: visit.locker.lockerNumber,
        amount: 0,
        type: null,
        mode: "LOCKER",
        remark: visit.remarks,
        isPassed: true,
        status: "VISITED",
        sourceModule: "locker",
        sourceAction: "Locker visit",
        account: {
          id: null,
          accountNumber: visit.locker.lockerNumber,
          branchId: null,
          branchCode: null,
          customer: visit.locker.customer
        },
        createdBy: null
      }))
    ];

    return activityRows
      .filter((row) => {
        if (!search) {
          return true;
        }

        return [
          row.transactionNumber,
          row.account.accountNumber,
          row.account.customer?.customerCode ?? "",
          row.account.customer?.firstName ?? "",
          row.account.customer?.lastName ?? "",
          row.mode,
          row.status,
          row.sourceModule,
          row.sourceAction,
          row.remark ?? "",
          row.createdBy?.fullName ?? "",
          row.createdBy?.username ?? ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .sort((left, right) => new Date(right.valueDate).getTime() - new Date(left.valueDate).getTime())
      .slice(0, 250);
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

    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { customerId: true }
    });

    if (!userProfile?.customerId) return { totalClients: 0, todayCollection: 0 };

    const mappedClientsCount = await this.prisma.agentClient.count({
      where: { agentId: userProfile.customerId, isActive: true }
    });

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
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const [rows, total] = await Promise.all([
      this.prisma.workingDay.findMany({
        where,
        include: {
          society: { select: { code: true, name: true } },
          openedBy: { select: { username: true, fullName: true } },
          closedBy: { select: { username: true, fullName: true } }
        },
        orderBy: { date: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.workingDay.count({ where })
    ]);

    return { page: query.page, limit: query.limit, total, rows };
  }

  async beginWorkingDay(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { societyId_date: { societyId, date } },
      update: { openedById: currentUser.sub, isDayEnd: false },
      create: { societyId, date, openedById: currentUser.sub }
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
      entryDate: { gte: date, lt: dayEnd }
    };

    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      cashbookFilter.createdBy = { societyId: currentUser.societyId ?? "" };
    }

    const postedResult = await this.prisma.cashBookEntry.updateMany({
      where: cashbookFilter,
      data: { isPosted: true, postedAt: new Date() }
    });

    const workingDay = await this.prisma.workingDay.upsert({
      where: { societyId_date: { societyId, date } },
      update: { isDayEnd: true, closedById: currentUser.sub },
      create: { societyId, date, isDayEnd: true, openedById: currentUser.sub, closedById: currentUser.sub }
    });

    return { workingDay, autoPostedCashbookEntries: postedResult.count };
  }

  async monthEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { societyId_date: { societyId, date } },
      update: { isMonthEnd: true, closedById: currentUser.sub },
      create: { societyId, date, isMonthEnd: true, openedById: currentUser.sub, closedById: currentUser.sub }
    });
  }

  async yearEnd(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const societyId = this.resolveOperatingSocietyId(currentUser);
    const date = this.toDayStart(dto.date);
    return this.prisma.workingDay.upsert({
      where: { societyId_date: { societyId, date } },
      update: { isYearEnd: true, closedById: currentUser.sub },
      create: { societyId, date, isYearEnd: true, openedById: currentUser.sub, closedById: currentUser.sub }
    });
  }

  async listUsers(currentUser: RequestUser) {
    this.ensureOperator(currentUser);
    const rows = await this.prisma.user.findMany({
      where: currentUser.role === UserRole.SUPER_ADMIN ? {} : { societyId: currentUser.societyId ?? "" },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        customerProfile: {
          select: {
            id: true,
            customerCode: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            address: true
          }
        },
        society: { select: { code: true, name: true } },
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    const accessMap = await this.getAllowedModuleMap(rows.map((entry) => entry.id));
    const userExtraFieldMap = await this.getUserExtraFieldMap(rows.map((entry) => entry.id));

    return rows
      .map((entry) => {
        const extras = userExtraFieldMap.get(entry.id) ?? {
          aadhaarNumber: null,
          isSocietyAdmin: false
        };

        return {
          ...entry,
          aadhaarNumber: extras.aadhaarNumber,
          isSocietyAdmin: extras.isSocietyAdmin,
          allowedModuleSlugs: accessMap.get(entry.id) ?? getDefaultAllowedModules(entry.role)
        };
      })
      .sort((left, right) => {
        if (left.isSocietyAdmin !== right.isSocietyAdmin) {
          return left.isSocietyAdmin ? -1 : 1;
        }

        return right.createdAt.getTime() - left.createdAt.getTime();
      });
  }

  async updateUser(currentUser: RequestUser, id: string, dto: UpdateUserDto) {
    this.ensureOperator(currentUser);

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        societyId: true,
        customerId: true
      }
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    this.assertCanManageUser(currentUser, target);
    const targetExtras = await this.getUserExtraFieldMap([target.id]);
    const targetExtra = targetExtras.get(target.id) ?? { aadhaarNumber: null, isSocietyAdmin: false };

    const normalizedUsername =
      dto.username === undefined ? undefined : this.normalizeUsername(dto.username);
    const normalizedFullName =
      dto.fullName === undefined ? undefined : this.normalizeFullName(dto.fullName);
    const normalizedAadhaarNumber =
      dto.aadhaarNumber === undefined ? undefined : this.normalizeAadhaarNumber(dto.aadhaarNumber);

    if (normalizedUsername !== undefined && !normalizedUsername) {
      throw new BadRequestException("Username cannot be empty");
    }

    if (normalizedFullName !== undefined && !normalizedFullName) {
      throw new BadRequestException("Full name cannot be empty");
    }

    if (normalizedUsername && normalizedUsername !== target.username.toLowerCase()) {
      const existing = await this.prisma.user.findUnique({
        where: { username: normalizedUsername },
        select: { id: true }
      });

      if (existing && existing.id !== id) {
        throw new ConflictException("Username already taken");
      }
    }

    if (normalizedAadhaarNumber && normalizedAadhaarNumber !== targetExtra.aadhaarNumber) {
      await this.assertAadhaarAvailable(normalizedAadhaarNumber, target.id);
    }

    const hasPasswordUpdate = Boolean(dto.password?.trim());
    const nextPasswordHash = hasPasswordUpdate ? await hash(dto.password!.trim(), 10) : undefined;
    const allowedModuleSlugs =
      dto.allowedModuleSlugs === undefined ? undefined : sanitizeAllowedModules(target.role, dto.allowedModuleSlugs);
    const requiresCustomerProfile = target.role === UserRole.CLIENT || target.role === UserRole.AGENT;

    return this.prisma.$transaction(async (tx) => {
      let nextCustomerId = target.customerId;
      const nextBranchId =
        dto.branchId === undefined
          ? undefined
          : await this.resolveManagedUserBranchId(target.societyId ?? this.resolveOperatingSocietyId(currentUser), dto.branchId, tx);

      if (requiresCustomerProfile && !nextCustomerId) {
        const societyId = target.societyId ?? this.resolveOperatingSocietyId(currentUser);
        const society = await tx.society.findUnique({
          where: { id: societyId },
          select: { id: true, code: true }
        });

        if (!society) {
          throw new NotFoundException("Society not found");
        }

        const identityName = normalizedFullName ?? target.fullName;
        const { firstName, lastName } = this.splitFullName(identityName);

        nextCustomerId = await this.createLinkedCustomerProfile(tx, {
          societyId: society.id,
          societyCode: society.code,
          role: target.role,
          firstName,
          lastName,
          aadhaarNumber: normalizedAadhaarNumber ?? targetExtra.aadhaarNumber ?? undefined
        });
      }

      if (requiresCustomerProfile && nextCustomerId && normalizedAadhaarNumber !== undefined) {
        await this.syncCustomerAadhaar(tx, nextCustomerId, normalizedAadhaarNumber);
      }

      if (requiresCustomerProfile && nextCustomerId && normalizedFullName !== undefined) {
        const identityName = normalizedFullName ?? target.fullName;
        const { firstName, lastName } = this.splitFullName(identityName);

        await tx.customer.update({
          where: { id: nextCustomerId },
          data: {
            firstName,
            lastName: lastName ?? null
          }
        });
      }

      const updated = await tx.user.update({
        where: { id },
        data: {
          ...(normalizedUsername !== undefined ? { username: normalizedUsername } : {}),
          ...(normalizedFullName !== undefined ? { fullName: normalizedFullName } : {}),
          ...(nextPasswordHash ? { passwordHash: nextPasswordHash, requiresPasswordChange: true } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(nextBranchId !== undefined ? { branchId: nextBranchId } : {}),
          ...(nextCustomerId && nextCustomerId !== target.customerId ? { customerId: nextCustomerId } : {})
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
          branchId: true,
          customerProfile: {
            select: {
              id: true,
              customerCode: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              address: true
            }
          },
          society: { select: { code: true, name: true } },
          createdAt: true
        }
      });

      if (normalizedAadhaarNumber !== undefined) {
        await this.updateUserAadhaarNumber(tx, id, normalizedAadhaarNumber);
      }

      if (allowedModuleSlugs) {
        await this.updateAllowedModules(tx, id, allowedModuleSlugs);
      }

      return {
        ...updated,
        aadhaarNumber: normalizedAadhaarNumber ?? targetExtra.aadhaarNumber,
        isSocietyAdmin: targetExtra.isSocietyAdmin,
        allowedModuleSlugs: allowedModuleSlugs ?? (await this.getAllowedModuleMap([id])).get(id) ?? getDefaultAllowedModules(updated.role)
      };
    });
  }

  async updateUserStatus(currentUser: RequestUser, id: string, dto: UpdateUserStatusDto) {
    this.ensureOperator(currentUser);
    const target = await this.prisma.user.findUnique({ where: { id }, select: { id: true, societyId: true, role: true } });
    if (!target) throw new NotFoundException("User not found");
    if (currentUser.role !== UserRole.SUPER_ADMIN && target.societyId !== currentUser.societyId) throw new ForbiddenException("User belongs to another society");
    if (target.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) throw new ForbiddenException("Only platform administrators can modify superadmin users");
    if (currentUser.role === UserRole.AGENT && target.role === UserRole.SUPER_USER) throw new ForbiddenException("Agent cannot modify this user");
    const targetExtra = (await this.getUserExtraFieldMap([id])).get(id) ?? { aadhaarNumber: null, isSocietyAdmin: false };
    if (targetExtra.isSocietyAdmin && dto.isActive === false) throw new ForbiddenException("Society administrator account cannot be disabled");

    return this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: { id: true, username: true, fullName: true, role: true, isActive: true }
    });
  }

  async updateUserAccess(currentUser: RequestUser, id: string, dto: { allowedModuleSlugs: string[] }) {
    this.ensureOperator(currentUser);
    const target = await this.prisma.user.findUnique({ where: { id }, select: { id: true, societyId: true, role: true } });
    if (!target) throw new NotFoundException("User not found");
    if (currentUser.role !== UserRole.SUPER_ADMIN && target.societyId !== currentUser.societyId) throw new ForbiddenException("User belongs to another society");
    if (currentUser.role === UserRole.AGENT && target.role !== UserRole.CLIENT) throw new ForbiddenException("Agents can update client access only");
    if (target.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Platform administrators are managed separately");

    const allowedModuleSlugs = sanitizeAllowedModules(target.role, dto.allowedModuleSlugs);
    await this.updateAllowedModules(this.prisma, id, allowedModuleSlugs);

    const updated = await this.prisma.user.findUnique({ where: { id }, select: { id: true, username: true, fullName: true, role: true, isActive: true } });
    return { ...updated, allowedModuleSlugs };
  }

  async deleteUser(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);

    if (currentUser.sub === id) {
      throw new ForbiddenException("You cannot remove your own account");
    }

    const target = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        societyId: true,
        customerId: true,
        _count: {
          select: {
            audits: true,
            cashBookEntries: true,
            paymentRequestsCreated: true,
            paymentTransactionsInitiated: true,
            reports: true,
            transactions: true,
            openedDays: true,
            closedDays: true
          }
        }
      }
    });

    if (!target) {
      throw new NotFoundException("User not found");
    }

    this.assertCanManageUser(currentUser, target);

    if (target.role === UserRole.SUPER_USER || target.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("This account type cannot be removed from user access");
    }

    if (this.hasRelatedActivity(target._count)) {
      throw new ConflictException("This account already has operational activity and cannot be removed");
    }

    if (target.customerId) {
      const linkedCustomer = await this.prisma.customer.findUnique({
        where: { id: target.customerId },
        select: {
          id: true,
          minors: { select: { id: true } },
          _count: {
            select: {
              accounts: true,
              agentClients: true,
              pigmyClients: true,
              benefits: true,
              demandDrafts: true,
              instruments: true,
              kycDocuments: true,
              loans: true,
              guarantor1Loans: true,
              guarantor2Loans: true,
              guarantor3Loans: true,
              lockers: true,
              paymentRequests: true,
              paymentTransactions: true
            }
          }
        }
      });

      if (linkedCustomer) {
        const linkedCustomerHasActivity =
          Boolean(linkedCustomer.minors) ||
          this.hasRelatedActivity(linkedCustomer._count);

        if (linkedCustomerHasActivity) {
          throw new ConflictException("This account is already linked to banking records and cannot be removed");
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });

      if (target.customerId) {
        await tx.agentClient.deleteMany({
          where: {
            OR: [{ agentId: target.customerId }, { customerId: target.customerId }]
          }
        });
        await tx.customer.delete({ where: { id: target.customerId } });
      }
    });

    return { id, deleted: true };
  }

  async recomputeAccountBalance(currentUser: RequestUser, accountId: string, dto: RecomputeAccountDto) {
    this.ensureOperator(currentUser);
    const account = await this.prisma.account.findUnique({ where: { id: accountId }, select: { id: true, societyId: true, accountNumber: true } });
    if (!account) throw new NotFoundException("Account not found");
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.societyId !== account.societyId) throw new ForbiddenException("Account belongs to another society");

    const transactionFilter: Prisma.TransactionWhereInput = { accountId, isPassed: true };
    if (dto.fromDate) transactionFilter.valueDate = { gte: new Date(dto.fromDate) };

    const [creditSum, debitSum] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { ...transactionFilter, type: TransactionType.CREDIT }, _sum: { amount: true } }),
      this.prisma.transaction.aggregate({ where: { ...transactionFilter, type: TransactionType.DEBIT }, _sum: { amount: true } })
    ]);

    const computedBalance = Number(creditSum._sum.amount ?? 0) - Number(debitSum._sum.amount ?? 0);
    await this.prisma.account.update({ where: { id: accountId }, data: { currentBalance: computedBalance } });

    return { accountId: account.id, accountNumber: account.accountNumber, recomputedBalance: computedBalance };
  }

  async recomputeGl(currentUser: RequestUser, dto: WorkingDayDto) {
    this.ensureOperator(currentUser);
    const targetDate = dto.date ? new Date(dto.date) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const where: Prisma.CashBookEntryWhereInput = { entryDate: { gte: dayStart, lt: dayEnd }, isPosted: true };
    if (currentUser.role !== UserRole.SUPER_ADMIN) where.createdBy = { societyId: currentUser.societyId ?? "" };

    const entries = await this.prisma.cashBookEntry.findMany({ where, select: { headCode: true, headName: true, amount: true, type: true } });
    const grouped = entries.reduce<Record<string, { headName: string; debit: number; credit: number }>>((acc, entry) => {
      if (!acc[entry.headCode]) acc[entry.headCode] = { headName: entry.headName, debit: 0, credit: 0 };
      if (entry.type === TransactionType.DEBIT) acc[entry.headCode].debit += Number(entry.amount);
      else acc[entry.headCode].credit += Number(entry.amount);
      return acc;
    }, {});

    return { date: dayStart.toISOString(), heads: grouped };
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
      include: { user: true, pigmyClients: { include: { customer: true } } }
    });

    if (!agent) throw new NotFoundException("Agent not found");

    const [daily, monthly] = await Promise.all([
      this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: this.toDayStart() } }, _sum: { amount: true } }),
      this.prisma.transaction.aggregate({ where: { createdById: agent.user!.id, type: "CREDIT", isPassed: true, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { amount: true } })
    ]);

    return { ...agent, performance: { daily: Number(daily._sum.amount || 0), monthly: Number(monthly._sum.amount || 0) } };
  }

  private ensureOperator(currentUser: RequestUser) {
    if (currentUser.role === UserRole.CLIENT) throw new ForbiddenException("Client users cannot access administration controls");
  }

  private assertCanManageUser(
    currentUser: RequestUser,
    target: {
      id: string;
      role: UserRole;
      societyId: string | null;
    }
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && target.societyId !== currentUser.societyId) {
      throw new ForbiddenException("User belongs to another society");
    }

    if (target.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only platform administrators can modify superadmin users");
    }

    if (currentUser.role === UserRole.AGENT && target.role !== UserRole.CLIENT) {
      throw new ForbiddenException("Agents can manage client accounts only");
    }
  }

  private resolveOperatingSocietyId(currentUser: RequestUser) {
    if (!currentUser.societyId) throw new ForbiddenException("Operator is not mapped to a society");
    return currentUser.societyId;
  }

  private toDayStart(date?: string): Date {
    const output = date ? new Date(date) : new Date();
    output.setHours(0, 0, 0, 0);
    return output;
  }

  private async getAllowedModuleMap(userIds: string[]) {
    return getUserAllowedModuleMap(this.prisma, userIds);
  }

  private async updateAllowedModules(tx: Prisma.TransactionClient | PrismaService, userId: string, allowedModuleSlugs: string[]) {
    await updateUserAllowedModules(tx, userId, allowedModuleSlugs);
  }

  private async updateUserAadhaarNumber(tx: Prisma.TransactionClient | PrismaService, userId: string, aadhaarNumber: string) {
    const { aadhaarNumber: supportsAadhaarNumber } = await this.getUserExtraFieldAvailability();

    if (!supportsAadhaarNumber) {
      return;
    }

    await tx.$executeRaw`
      UPDATE "User"
      SET "aadhaarNumber" = ${aadhaarNumber}
      WHERE "id" = ${userId}
    `;
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

  private async getUserExtraFieldMap(userIds: string[]) {
    if (userIds.length === 0) {
      return new Map<string, { aadhaarNumber: string | null; isSocietyAdmin: boolean }>();
    }

    const columnAvailability = await this.getUserExtraFieldAvailability();
    const defaultExtras: { aadhaarNumber: string | null; isSocietyAdmin: boolean } = {
      aadhaarNumber: null,
      isSocietyAdmin: false
    };

    if (!columnAvailability.aadhaarNumber && !columnAvailability.isSocietyAdmin) {
      return new Map(userIds.map((userId) => [userId, defaultExtras]));
    }

    const userIdValues = userIds.map((userId) => Prisma.sql`${userId}`);
    const aadhaarNumberSelect = columnAvailability.aadhaarNumber
      ? Prisma.sql`"aadhaarNumber"`
      : Prisma.sql`NULL::TEXT AS "aadhaarNumber"`;
    const societyAdminSelect = columnAvailability.isSocietyAdmin
      ? Prisma.sql`"isSocietyAdmin"`
      : Prisma.sql`FALSE AS "isSocietyAdmin"`;
    const rows = await this.prisma.$queryRaw<Array<{ id: string; aadhaarNumber: string | null; isSocietyAdmin: boolean }>>(
      Prisma.sql`
        SELECT "id", ${aadhaarNumberSelect}, ${societyAdminSelect}
        FROM "User"
        WHERE "id" IN (${Prisma.join(userIdValues)})
      `
    );

    const extrasByUserId = new Map(userIds.map((userId) => [userId, defaultExtras]));
    rows.forEach((row) => {
      extrasByUserId.set(row.id, { aadhaarNumber: row.aadhaarNumber, isSocietyAdmin: row.isSocietyAdmin });
    });

    return extrasByUserId;
  }

  private async createLinkedCustomerProfile(
    tx: Prisma.TransactionClient,
    input: {
      societyId: string;
      societyCode: string;
      role: UserRole;
      firstName: string;
      lastName?: string;
      aadhaarNumber?: string;
    }
  ) {
    const prefix = input.role === UserRole.AGENT ? "A" : "C";
    const count = await tx.customer.count({ where: { societyId: input.societyId } });
    const customerCode = `${input.societyCode}-${prefix}${String(count + 1).padStart(5, "0")}`;

    const customer = await tx.customer.create({
      data: {
        customerCode,
        societyId: input.societyId,
        firstName: input.firstName,
        lastName: input.lastName
      },
      select: { id: true }
    });

    if (input.aadhaarNumber) {
      await this.syncCustomerAadhaar(tx, customer.id, input.aadhaarNumber);
    }

    return customer.id;
  }

  private normalizeOptionalText(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private normalizeUsername(value: string) {
    return value.trim().toLowerCase().replace(/^@+/, "").replace(/\s+/g, "");
  }

  private normalizeFullName(value: string) {
    return value.trim().replace(/\s+/g, " ");
  }

  private normalizeAadhaarNumber(value: string) {
    const normalizedValue = value.replace(/\D/g, "");

    if (normalizedValue.length !== 12) {
      throw new BadRequestException("Aadhaar number must be exactly 12 digits");
    }

    return normalizedValue;
  }

  private splitFullName(fullName: string) {
    const [firstName, ...restName] = fullName.trim().split(/\s+/);
    return {
      firstName,
      lastName: restName.join(" ") || undefined
    };
  }

  private hasRelatedActivity(counts: Record<string, number>) {
    return Object.values(counts).some((value) => value > 0);
  }

  private buildProvisionedFullName(role: UserRole, aadhaarNumber: string) {
    const aadhaarSuffix = aadhaarNumber.slice(-4);

    if (role === UserRole.SUPER_USER) {
      return `Society Staff ${aadhaarSuffix}`;
    }

    if (role === UserRole.AGENT) {
      return `Agent ${aadhaarSuffix}`;
    }

    return `Client ${aadhaarSuffix}`;
  }

  private async assertAadhaarAvailable(aadhaarNumber: string, excludeUserId?: string) {
    const { aadhaarNumber: supportsAadhaarNumber } = await this.getUserExtraFieldAvailability();

    if (!supportsAadhaarNumber) {
      return;
    }

    const existingUser = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE "aadhaarNumber" = ${aadhaarNumber}
      LIMIT 1
    `;

    if (existingUser[0] && existingUser[0].id !== excludeUserId) {
      throw new ConflictException("Aadhaar number is already registered");
    }
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
          data: {
            isActive: true
          }
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
      select: {
        id: true
      }
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

  private async resolveManagedUserBranchId(
    societyId: string,
    branchId?: string | null,
    tx: Prisma.TransactionClient | PrismaService = this.prisma
  ) {
    const normalizedBranchId = this.normalizeOptionalText(branchId);

    if (!normalizedBranchId) {
      const headOfficeBranch = await this.ensureHeadOfficeBranch(tx, societyId);
      return headOfficeBranch.id;
    }

    const branch = await tx.branch.findFirst({
      where: {
        id: normalizedBranchId,
        societyId
      },
      select: { id: true }
    });

    if (!branch) {
      throw new NotFoundException("Selected branch does not belong to your society");
    }

    return branch.id;
  }

  private async createProvisionedZeroBalanceAccount(
    tx: Prisma.TransactionClient,
    input: {
      societyId: string;
      customerId: string;
      branchId?: string | null;
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

    const branch = input.branchId
      ? await tx.branch.findUnique({
          where: { id: input.branchId },
          select: {
            code: true
          }
        })
      : null;

    const accountNumber = await this.generateProvisionedAccountNumber(tx, input.societyId, input.branchId ?? null, type);

    await tx.account.create({
      data: {
        accountNumber,
        societyId: input.societyId,
        customerId: input.customerId,
        type,
        status: AccountStatus.ACTIVE,
        currentBalance: 0,
        branchId: input.branchId ?? null,
        branchCode: branch?.code ?? null,
        isPassbookEnabled: input.role === UserRole.CLIENT
      }
    });
  }

  private async generateProvisionedAccountNumber(
    tx: Prisma.TransactionClient | PrismaService,
    societyId: string,
    branchId: string | null,
    type: AccountType
  ) {
    const [society, branch, count] = await Promise.all([
      tx.society.findUnique({
        where: { id: societyId },
        select: {
          code: true
        }
      }),
      branchId
        ? tx.branch.findUnique({
            where: { id: branchId },
            select: {
              code: true
            }
          })
        : Promise.resolve(null),
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

  private async syncCustomerAadhaar(tx: Prisma.TransactionClient, customerId: string, aadhaarNumber: string) {
    const existingAadhaarDocument = await tx.kycDocument.findFirst({
      where: {
        customerId,
        docType: "AADHAAR"
      },
      select: {
        id: true
      }
    });

    if (existingAadhaarDocument) {
      await tx.kycDocument.update({
        where: {
          id: existingAadhaarDocument.id
        },
        data: {
          docNumber: aadhaarNumber
        }
      });
      return;
    }

    await tx.kycDocument.create({
      data: {
        customerId,
        docType: "AADHAAR",
        docNumber: aadhaarNumber
      }
    });
  }
}
