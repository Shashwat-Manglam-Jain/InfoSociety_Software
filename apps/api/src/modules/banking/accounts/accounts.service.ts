import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { ListAccountsQueryDto } from "./dto/list-accounts-query.dto";
import { UpdateAccountStatusDto } from "./dto/update-account-status.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "accounts",
      ...bankingFeatureMap["accounts"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["accounts"].workflows;
  }

  async list(currentUser: RequestUser, query: ListAccountsQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.account.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              firstName: true,
              lastName: true
            }
          },
          society: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          depositAccount: {
            select: {
              id: true,
              maturityDate: true,
              maturityAmount: true
            }
          },
          loanAccount: {
            select: {
              id: true,
              status: true,
              sanctionedAmount: true,
              overdueAmount: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.account.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async getById(currentUser: RequestUser, id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        customer: true,
        society: {
          select: {
            code: true,
            name: true
          }
        },
        depositAccount: true,
        loanAccount: true,
        _count: {
          select: {
            transactions: true,
            ledgerEntries: true
          }
        }
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureScope(currentUser, account.societyId, account.customerId);
    return account;
  }

  async create(currentUser: RequestUser, dto: CreateAccountDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create accounts");
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: {
        id: true,
        societyId: true,
        society: {
          select: {
            code: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    this.ensureScope(currentUser, customer.societyId);

    const accountNumber = dto.accountNumber?.trim()
      ? dto.accountNumber.trim().toUpperCase()
      : await this.generateAccountNumber(customer.society.code, dto.type);

    return this.prisma.account.create({
      data: {
        accountNumber,
        societyId: customer.societyId,
        customerId: customer.id,
        type: dto.type,
        currentBalance: dto.openingBalance ?? 0,
        interestRate: dto.interestRate,
        branchCode: dto.branchCode,
        isPassbookEnabled: dto.isPassbookEnabled ?? true
      },
      include: {
        customer: {
          select: {
            customerCode: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateAccountDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify accounts");
    }

    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        societyId: true,
        customerId: true
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureScope(currentUser, account.societyId);

    return this.prisma.account.update({
      where: { id },
      data: dto
    });
  }

  async updateStatus(currentUser: RequestUser, id: string, dto: UpdateAccountStatusDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot change account status");
    }

    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        societyId: true
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureScope(currentUser, account.societyId);

    return this.prisma.account.update({
      where: { id },
      data: {
        status: dto.status
      }
    });
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListAccountsQueryDto): Promise<Prisma.AccountWhereInput> {
    const where: Prisma.AccountWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.customerId = currentUser.customerId ?? "";
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      where.societyId = currentUser.societyId ?? "";
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { accountNumber: { contains: query.q, mode: "insensitive" } },
        { branchCode: { contains: query.q, mode: "insensitive" } },
        { customer: { customerCode: { contains: query.q, mode: "insensitive" } } },
        { customer: { firstName: { contains: query.q, mode: "insensitive" } } },
        { customer: { lastName: { contains: query.q, mode: "insensitive" } } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string, customerId?: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Account belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT && customerId !== currentUser.customerId) {
      throw new ForbiddenException("You can access only your own account");
    }
  }

  private async generateAccountNumber(societyCode: string, type: AccountType) {
    const prefixMap: Record<AccountType, string> = {
      SAVINGS: "SB",
      CURRENT: "CA",
      FIXED_DEPOSIT: "FD",
      RECURRING_DEPOSIT: "RD",
      LOAN: "LN",
      PIGMY: "PG",
      GENERAL: "GL"
    };

    const prefix = prefixMap[type];
    const count = await this.prisma.account.count({
      where: {
        society: {
          code: societyCode
        },
        type
      }
    });

    return `${prefix}${String(count + 1).padStart(7, "0")}`;
  }
}
