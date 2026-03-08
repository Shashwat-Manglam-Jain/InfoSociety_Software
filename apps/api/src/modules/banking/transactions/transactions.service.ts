import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TransactionType, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CancelTransactionDto } from "./dto/cancel-transaction.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "transactions",
      ...bankingFeatureMap["transactions"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["transactions"].workflows;
  }

  async list(currentUser: RequestUser, query: ListTransactionsQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              societyId: true,
              customerId: true
            }
          },
          createdBy: {
            select: {
              username: true,
              fullName: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.transaction.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateTransactionDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create transactions directly");
    }

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
      select: {
        id: true,
        societyId: true,
        status: true
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureScope(currentUser, account.societyId);

    if (account.status === "CLOSED") {
      throw new BadRequestException("Closed account cannot accept transactions");
    }

    const transactionNumber = await this.generateTransactionNumber();

    return this.prisma.transaction.create({
      data: {
        transactionNumber,
        accountId: account.id,
        valueDate: dto.valueDate ? new Date(dto.valueDate) : new Date(),
        amount: dto.amount,
        type: dto.type,
        mode: dto.mode,
        remark: dto.remark,
        createdById: currentUser.sub
      }
    });
  }

  async pass(currentUser: RequestUser, id: string) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot pass transactions");
    }

    const transaction = await this.prisma.transaction.findUnique({
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

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    this.ensureScope(currentUser, transaction.account.societyId);

    if (transaction.isPassed) {
      return transaction;
    }

    const nextBalance = this.computeNextBalance(
      Number(transaction.account.currentBalance),
      Number(transaction.amount),
      transaction.type
    );

    if (nextBalance < 0) {
      throw new BadRequestException("Insufficient balance to pass this transaction");
    }

    return this.prisma.$transaction(async (tx) => {
      const passedTxn = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          isPassed: true,
          passedAt: new Date()
        }
      });

      await tx.account.update({
        where: { id: transaction.account.id },
        data: {
          currentBalance: nextBalance
        }
      });

      await tx.ledgerEntry.create({
        data: {
          accountId: transaction.account.id,
          transactionId: transaction.id,
          balanceAfter: nextBalance
        }
      });

      return passedTxn;
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateTransactionDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify transactions");
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    this.ensureScope(currentUser, transaction.account.societyId);

    if (transaction.isPassed) {
      return this.prisma.transaction.update({
        where: { id },
        data: {
          mode: dto.mode ?? transaction.mode,
          remark: dto.remark ?? transaction.remark
        }
      });
    }

    return this.prisma.transaction.update({
      where: { id },
      data: dto
    });
  }

  async cancel(currentUser: RequestUser, id: string, dto: CancelTransactionDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot cancel transactions");
    }

    const transaction = await this.prisma.transaction.findUnique({
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

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    this.ensureScope(currentUser, transaction.account.societyId);

    if (!transaction.isPassed) {
      return this.prisma.transaction.delete({
        where: { id: transaction.id }
      });
    }

    const reversalType = transaction.type === TransactionType.CREDIT ? TransactionType.DEBIT : TransactionType.CREDIT;
    const reversalNumber = await this.generateTransactionNumber();
    const nextBalance = this.computeNextBalance(
      Number(transaction.account.currentBalance),
      Number(transaction.amount),
      reversalType
    );

    if (nextBalance < 0) {
      throw new BadRequestException("Cannot cancel transaction because reversal will make balance negative");
    }

    return this.prisma.$transaction(async (tx) => {
      const reversal = await tx.transaction.create({
        data: {
          transactionNumber: reversalNumber,
          accountId: transaction.account.id,
          valueDate: new Date(),
          amount: transaction.amount,
          type: reversalType,
          mode: transaction.mode,
          remark: dto.reason
            ? `Reversal for ${transaction.transactionNumber}: ${dto.reason}`
            : `Reversal for ${transaction.transactionNumber}`,
          isPassed: true,
          passedAt: new Date(),
          createdById: currentUser.sub
        }
      });

      await tx.account.update({
        where: { id: transaction.account.id },
        data: {
          currentBalance: nextBalance
        }
      });

      await tx.ledgerEntry.create({
        data: {
          accountId: transaction.account.id,
          transactionId: reversal.id,
          balanceAfter: nextBalance
        }
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          remark: transaction.remark
            ? `${transaction.remark} [CANCELLED by ${reversal.transactionNumber}]`
            : `[CANCELLED by ${reversal.transactionNumber}]`
        }
      });

      return {
        cancelledTransactionId: transaction.id,
        reversalTransactionId: reversal.id,
        reversalTransactionNumber: reversal.transactionNumber
      };
    });
  }

  private async getScopedWhere(
    currentUser: RequestUser,
    query: ListTransactionsQueryDto
  ): Promise<Prisma.TransactionWhereInput> {
    const where: Prisma.TransactionWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.account = {
        customerId: currentUser.customerId ?? ""
      };
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

    if (query.accountId) {
      where.accountId = query.accountId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.mode) {
      where.mode = query.mode;
    }

    if (query.isPassed !== undefined) {
      where.isPassed = query.isPassed === "true";
    }

    if (query.q) {
      where.OR = [
        { transactionNumber: { contains: query.q, mode: "insensitive" } },
        { remark: { contains: query.q, mode: "insensitive" } },
        { account: { accountNumber: { contains: query.q, mode: "insensitive" } } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string) {
    if (currentUser.role === UserRole.SUPER_USER) {
      return;
    }

    if (currentUser.role === UserRole.AGENT && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Transaction belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client access is not allowed for this action");
    }
  }

  private computeNextBalance(balance: number, amount: number, type: TransactionType): number {
    return type === TransactionType.CREDIT ? balance + amount : balance - amount;
  }

  private async generateTransactionNumber(): Promise<string> {
    const count = await this.prisma.transaction.count();
    return `TXN${String(count + 1).padStart(8, "0")}`;
  }
}
