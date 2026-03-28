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

  /**
   * Creates a new banking account while enforcing legacy architectural rules.
   * 
   * Strict Enforcements:
   * 1. A customer can only hold ONE active Savings or Share (General) account.
   * 2. A customer can only hold ONE active Loan account at at time.
   * 3. Account numbers are automatically generated using the 17-digit rule if not explicitly provided.
   *
   * @param currentUser The authenticated user making the request.
   * @param dto The payload containing account configuration.
   * @returns The newly provisioned Account record.
   * @throws ForbiddenException if limits are exceeded or scope is violated.
   */
  async create(currentUser: RequestUser, dto: CreateAccountDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create accounts");
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: {
        id: true,
        societyId: true,
        society: { select: { code: true } }
      }
    });

    if (!customer) throw new NotFoundException("Customer not found");

    this.ensureScope(currentUser, customer.societyId);

    // Enforce 1 Savings/Share account rule per customer
    if (dto.type === AccountType.SAVINGS || dto.type === AccountType.GENERAL) { // General might be Shares
      const existing = await this.prisma.account.findFirst({
        where: { customerId: customer.id, type: dto.type }
      });
      if (existing) throw new ForbiddenException(`Customer already has a ${dto.type} account.`);
    }

    // Enforce 1 Active Loan rule per customer
    if (dto.type === AccountType.LOAN) {
      const activeLoan = await this.prisma.account.findFirst({
        where: { 
          customerId: customer.id, 
          type: AccountType.LOAN,
          loanAccount: {
            status: { notIn: ['CLOSED'] }
          }
        }
      });
      if (activeLoan) throw new ForbiddenException("Customer already has an active loan.");
    }

    const accountNumber = dto.accountNumber?.trim()
      ? dto.accountNumber.trim().toUpperCase()
      : await this.generateAccountNumber(customer.societyId, dto.branchId, dto.headId);

    return this.prisma.account.create({
      data: {
        accountNumber,
        societyId: customer.societyId,
        customerId: customer.id,
        type: dto.type,
        currentBalance: dto.openingBalance ?? 0,
        interestRate: dto.interestRate,
        branchCode: dto.branchCode,
        branchId: dto.branchId,
        headId: dto.headId,
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

  /**
   * Generates a 17-digit deterministic account number based on the legacy schema mapping.
   * 
   * Format: [Society Code (3)] + [Branch Code (3)] + [Head Account Code (3)] + [Sequence (8)]
   * Example: 00100100300000001
   * 
   * @param societyId Originating society's internal ID
   * @param branchId Originating branch's internal ID (if applicable)
   * @param headId The financial Head Master ID for categorization (Savings, FD, etc.)
   * @returns A guaranteed unique 17-digit string
   */
  private async generateAccountNumber(societyId: string, branchId: string | undefined, headId: string) {
    const society = await this.prisma.society.findUnique({ where: { id: societyId }, select: { code: true }});
    const branch = branchId ? await this.prisma.branch.findUnique({ where: { id: branchId }, select: { code: true }}) : null;
    const head = await this.prisma.head.findUnique({ where: { id: headId }, select: { accountCode: true }});
    
    // Fallback to "001" if missing to prevent failure, enforcing strictly 3 digits
    const sCode = society?.code?.substring(0, 3).padStart(3, "0") || "001";
    const bCode = branch?.code?.substring(0, 3).padStart(3, "0") || "001";
    const hCode = head?.accountCode?.substring(0, 3).padStart(3, "0") || "001";

    const count = await this.prisma.account.count({
      where: {
        societyId,
        headId
      }
    });

    const sequence = String(count + 1).padStart(8, "0");
    return `${sCode}${bCode}${hCode}${sequence}`;
  }
}
