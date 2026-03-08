import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, LoanStatus, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { ApplyLoanDto } from "./dto/apply-loan.dto";
import { DisburseLoanDto } from "./dto/disburse-loan.dto";
import { ListLoansQueryDto } from "./dto/list-loans-query.dto";
import { RecoverLoanDto } from "./dto/recover-loan.dto";
import { SanctionLoanDto } from "./dto/sanction-loan.dto";
import { UpdateOverdueDto } from "./dto/update-overdue.dto";

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "loans",
      ...bankingFeatureMap["loans"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["loans"].workflows;
  }

  async list(currentUser: RequestUser, query: ListLoansQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.loanAccount.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              societyId: true,
              currentBalance: true
            }
          },
          customer: {
            select: {
              id: true,
              customerCode: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.loanAccount.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async apply(currentUser: RequestUser, dto: ApplyLoanDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: {
        id: true,
        societyId: true
      }
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    this.ensureScope(currentUser, customer.societyId, customer.id);

    if (currentUser.role === UserRole.CLIENT && currentUser.customerId !== customer.id) {
      throw new ForbiddenException("Client can apply only for own customer profile");
    }

    return this.prisma.$transaction(async (tx) => {
      let accountId = dto.accountId;

      if (accountId) {
        const existingAccount = await tx.account.findUnique({
          where: { id: accountId },
          select: {
            id: true,
            customerId: true,
            societyId: true,
            type: true,
            loanAccount: {
              select: {
                id: true
              }
            }
          }
        });

        if (!existingAccount) {
          throw new NotFoundException("Linked account not found");
        }

        if (existingAccount.customerId !== customer.id || existingAccount.societyId !== customer.societyId) {
          throw new BadRequestException("Account is not linked to this customer");
        }

        if (existingAccount.type !== AccountType.LOAN) {
          throw new BadRequestException("Linked account must be a loan account type");
        }

        if (existingAccount.loanAccount) {
          throw new BadRequestException("Loan record already exists for this account");
        }
      } else {
        const accountNumber = await this.generateLoanAccountNumber(customer.societyId, tx);
        const createdAccount = await tx.account.create({
          data: {
            accountNumber,
            societyId: customer.societyId,
            customerId: customer.id,
            type: AccountType.LOAN,
            currentBalance: 0,
            status: "ACTIVE",
            isPassbookEnabled: false
          }
        });

        accountId = createdAccount.id;
      }

      return tx.loanAccount.create({
        data: {
          accountId: accountId!,
          customerId: customer.id,
          applicationAmount: dto.applicationAmount,
          interestRate: dto.interestRate,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          status: LoanStatus.APPLIED
        },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true
            }
          }
        }
      });
    });
  }

  async sanction(currentUser: RequestUser, id: string, dto: SanctionLoanDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot sanction loans");
    }

    const loan = await this.prisma.loanAccount.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!loan) {
      throw new NotFoundException("Loan account not found");
    }

    this.ensureScope(currentUser, loan.account.societyId, loan.customerId);

    if (loan.status === LoanStatus.CLOSED) {
      throw new BadRequestException("Closed loan cannot be sanctioned");
    }

    return this.prisma.loanAccount.update({
      where: { id },
      data: {
        sanctionedAmount: dto.sanctionedAmount,
        sanctionDate: dto.sanctionDate ? new Date(dto.sanctionDate) : new Date(),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : loan.expiryDate,
        status: LoanStatus.SANCTIONED
      }
    });
  }

  async disburse(currentUser: RequestUser, id: string, dto: DisburseLoanDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot disburse loans");
    }

    const loan = await this.prisma.loanAccount.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            societyId: true
          }
        }
      }
    });

    if (!loan) {
      throw new NotFoundException("Loan account not found");
    }

    this.ensureScope(currentUser, loan.account.societyId, loan.customerId);

    const sanctionedAmount = Number(loan.sanctionedAmount ?? 0);
    if (sanctionedAmount <= 0) {
      throw new BadRequestException("Loan must be sanctioned before disbursement");
    }

    const alreadyDisbursed = Number(loan.disbursedAmount ?? 0);
    if (alreadyDisbursed + dto.amount > sanctionedAmount) {
      throw new BadRequestException("Disbursement exceeds sanctioned amount");
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.loanAccount.update({
        where: { id },
        data: {
          disbursedAmount: alreadyDisbursed + dto.amount,
          status: LoanStatus.DISBURSED
        }
      });

      await tx.account.update({
        where: { id: loan.account.id },
        data: {
          currentBalance: {
            increment: dto.amount
          }
        }
      });

      return updatedLoan;
    });
  }

  async recover(currentUser: RequestUser, id: string, dto: RecoverLoanDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot record recovery");
    }

    const loan = await this.prisma.loanAccount.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            societyId: true,
            currentBalance: true
          }
        }
      }
    });

    if (!loan) {
      throw new NotFoundException("Loan account not found");
    }

    this.ensureScope(currentUser, loan.account.societyId, loan.customerId);

    const balance = Number(loan.account.currentBalance);
    if (dto.amount > balance) {
      throw new BadRequestException("Recovery amount exceeds outstanding loan balance");
    }

    const overdue = Number(loan.overdueAmount);
    const nextOverdue = Math.max(0, overdue - dto.amount);
    const nextBalance = Math.max(0, balance - dto.amount);

    return this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: loan.account.id },
        data: {
          currentBalance: nextBalance
        }
      });

      return tx.loanAccount.update({
        where: { id },
        data: {
          overdueAmount: nextOverdue,
          status: nextBalance === 0 && nextOverdue === 0 ? LoanStatus.CLOSED : loan.status
        }
      });
    });
  }

  async updateOverdue(currentUser: RequestUser, id: string, dto: UpdateOverdueDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot update overdue");
    }

    const loan = await this.prisma.loanAccount.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!loan) {
      throw new NotFoundException("Loan account not found");
    }

    this.ensureScope(currentUser, loan.account.societyId, loan.customerId);

    return this.prisma.loanAccount.update({
      where: { id },
      data: {
        overdueAmount: dto.overdueAmount,
        status: dto.overdueAmount > 0 ? LoanStatus.OVERDUE : loan.status
      }
    });
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListLoansQueryDto): Promise<Prisma.LoanAccountWhereInput> {
    const where: Prisma.LoanAccountWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.customerId = currentUser.customerId ?? "";
    }

    if (currentUser.role === UserRole.AGENT) {
      where.account = {
        societyId: currentUser.societyId ?? ""
      };
    }

    if (currentUser.role === UserRole.SUPER_USER && query.societyCode) {
      const society = await this.prisma.society.findUnique({
        where: { code: query.societyCode.trim().toUpperCase() },
        select: { id: true }
      });

      where.account = {
        societyId: society?.id ?? ""
      };
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { account: { accountNumber: { contains: query.q, mode: "insensitive" } } },
        { customer: { customerCode: { contains: query.q, mode: "insensitive" } } },
        { customer: { firstName: { contains: query.q, mode: "insensitive" } } },
        { customer: { lastName: { contains: query.q, mode: "insensitive" } } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string, customerId?: string) {
    if (currentUser.role === UserRole.SUPER_USER) {
      return;
    }

    if (currentUser.role === UserRole.AGENT && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Loan belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT && currentUser.customerId !== customerId) {
      throw new ForbiddenException("Client can access only own loan profile");
    }
  }

  private async generateLoanAccountNumber(
    societyId: string,
    tx: Prisma.TransactionClient | PrismaService
  ): Promise<string> {
    const count = await tx.account.count({
      where: {
        societyId,
        type: AccountType.LOAN
      }
    });

    return `LN${String(count + 1).padStart(7, "0")}`;
  }
}
