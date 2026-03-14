import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AccountType, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateDepositSchemeDto } from "./dto/create-deposit-scheme.dto";
import { ListDepositsQueryDto } from "./dto/list-deposits-query.dto";
import { OpenDepositAccountDto } from "./dto/open-deposit-account.dto";
import { RenewDepositDto } from "./dto/renew-deposit.dto";
import { UpdateDepositLienDto } from "./dto/update-deposit-lien.dto";

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "deposits",
      ...bankingFeatureMap["deposits"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["deposits"].workflows;
  }

  getSchemes() {
    return this.prisma.depositScheme.findMany({
      orderBy: [{ recurring: "asc" }, { minMonths: "asc" }]
    });
  }

  async createScheme(currentUser: RequestUser, dto: CreateDepositSchemeDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create schemes");
    }

    if (dto.maxMonths < dto.minMonths) {
      throw new BadRequestException("maxMonths must be greater than or equal to minMonths");
    }

    return this.prisma.depositScheme.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        minMonths: dto.minMonths,
        maxMonths: dto.maxMonths,
        interestRate: dto.interestRate,
        recurring: dto.recurring
      }
    });
  }

  async list(currentUser: RequestUser, query: ListDepositsQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.depositAccount.findMany({
        where,
        include: {
          scheme: true,
          account: {
            select: {
              id: true,
              accountNumber: true,
              societyId: true,
              customerId: true,
              customer: {
                select: {
                  customerCode: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          maturityDate: "asc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.depositAccount.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async open(currentUser: RequestUser, dto: OpenDepositAccountDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot open deposit accounts");
    }

    const account = await this.prisma.account.findUnique({
      where: { id: dto.accountId },
      include: {
        society: {
          select: { code: true }
        },
        depositAccount: {
          select: { id: true }
        }
      }
    });

    if (!account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureSocietyScope(currentUser, account.societyId);

    if (account.type !== AccountType.FIXED_DEPOSIT && account.type !== AccountType.RECURRING_DEPOSIT) {
      throw new BadRequestException("Only FD/RD accounts can be linked to a deposit account");
    }

    if (account.depositAccount) {
      throw new BadRequestException("Deposit record already exists for this account");
    }

    const scheme = await this.prisma.depositScheme.findUnique({
      where: { id: dto.schemeId }
    });

    if (!scheme) {
      throw new NotFoundException("Deposit scheme not found");
    }

    const durationMonths = dto.durationMonths ?? scheme.minMonths;
    if (durationMonths < scheme.minMonths || durationMonths > scheme.maxMonths) {
      throw new BadRequestException("Duration is outside the selected scheme range");
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const maturityDate = this.addMonths(startDate, durationMonths);
    const maturityAmount = this.computeMaturityAmount(dto.principalAmount, Number(scheme.interestRate), durationMonths);

    return this.prisma.$transaction(async (tx) => {
      const depositAccount = await tx.depositAccount.create({
        data: {
          accountId: account.id,
          schemeId: scheme.id,
          principalAmount: dto.principalAmount,
          maturityDate,
          maturityAmount
        },
        include: {
          scheme: true
        }
      });

      await tx.account.update({
        where: { id: account.id },
        data: {
          currentBalance: dto.principalAmount,
          interestRate: scheme.interestRate
        }
      });

      return depositAccount;
    });
  }

  async renew(currentUser: RequestUser, id: string, dto: RenewDepositDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot renew deposit accounts");
    }

    const deposit = await this.prisma.depositAccount.findUnique({
      where: { id },
      include: {
        scheme: true,
        account: {
          select: {
            id: true,
            societyId: true
          }
        }
      }
    });

    if (!deposit) {
      throw new NotFoundException("Deposit account not found");
    }

    this.ensureSocietyScope(currentUser, deposit.account.societyId);

    const durationMonths = dto.durationMonths ?? deposit.scheme.minMonths;
    if (durationMonths < deposit.scheme.minMonths || durationMonths > deposit.scheme.maxMonths) {
      throw new BadRequestException("Duration is outside the scheme range");
    }

    const principalAmount = dto.principalAmount ?? Number(deposit.maturityAmount);
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date(deposit.maturityDate);
    const maturityDate = this.addMonths(startDate, durationMonths);
    const maturityAmount = this.computeMaturityAmount(
      principalAmount,
      Number(deposit.scheme.interestRate),
      durationMonths
    );

    return this.prisma.$transaction(async (tx) => {
      const renewed = await tx.depositAccount.update({
        where: { id: deposit.id },
        data: {
          principalAmount,
          maturityDate,
          maturityAmount,
          renewalCount: {
            increment: 1
          }
        },
        include: {
          scheme: true
        }
      });

      await tx.account.update({
        where: { id: deposit.account.id },
        data: {
          currentBalance: principalAmount
        }
      });

      return renewed;
    });
  }

  async updateLien(currentUser: RequestUser, id: string, dto: UpdateDepositLienDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify lien status");
    }

    const deposit = await this.prisma.depositAccount.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!deposit) {
      throw new NotFoundException("Deposit account not found");
    }

    this.ensureSocietyScope(currentUser, deposit.account.societyId);

    return this.prisma.depositAccount.update({
      where: { id },
      data: {
        lienMarked: dto.lienMarked
      }
    });
  }

  private async getScopedWhere(currentUser: RequestUser, query: ListDepositsQueryDto): Promise<Prisma.DepositAccountWhereInput> {
    const where: Prisma.DepositAccountWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.account = { customerId: currentUser.customerId ?? "" };
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      where.account = { societyId: currentUser.societyId ?? "" };
    }

    if (query.maturityBefore) {
      where.maturityDate = {
        lte: new Date(query.maturityBefore)
      };
    }

    if (query.recurring !== undefined) {
      const recurring = query.recurring === "true";
      where.scheme = {
        recurring
      };
    }

    if (query.q) {
      where.OR = [
        { account: { accountNumber: { contains: query.q, mode: "insensitive" } } },
        { scheme: { code: { contains: query.q, mode: "insensitive" } } },
        { scheme: { name: { contains: query.q, mode: "insensitive" } } },
        { account: { customer: { customerCode: { contains: query.q, mode: "insensitive" } } } }
      ];
    }

    return where;
  }

  private ensureSocietyScope(currentUser: RequestUser, societyId: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Record belongs to another society");
    }

    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client access is not allowed for this action");
    }
  }

  private addMonths(date: Date, months: number): Date {
    const output = new Date(date);
    output.setMonth(output.getMonth() + months);
    return output;
  }

  private computeMaturityAmount(principal: number, annualRate: number, months: number): number {
    const factor = 1 + (annualRate * months) / 1200;
    return Number((principal * factor).toFixed(2));
  }
}
