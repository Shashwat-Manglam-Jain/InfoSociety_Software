import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateInvestmentDto } from "./dto/create-investment.dto";
import { ListInvestmentsQueryDto } from "./dto/list-investments-query.dto";
import { RenewInvestmentDto } from "./dto/renew-investment.dto";
import { WithdrawInvestmentDto } from "./dto/withdraw-investment.dto";

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "investments",
      ...bankingFeatureMap["investments"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["investments"].workflows;
  }

  async list(currentUser: RequestUser, query: ListInvestmentsQueryDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot access bank investment records");
    }

    const where: Prisma.InvestmentWhereInput = {};

    if (query.activeOnly === "true") {
      where.withdrawnDate = null;
    }

    if (query.maturityBefore) {
      where.maturityDate = {
        lte: new Date(query.maturityBefore)
      };
    }

    if (query.q) {
      where.OR = [
        { bankName: { contains: query.q, mode: "insensitive" } },
        { investmentType: { contains: query.q, mode: "insensitive" } }
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.investment.findMany({
        where,
        orderBy: {
          maturityDate: "asc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.investment.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateInvestmentDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create investment entries");
    }

    const startDate = new Date(dto.startDate);
    const maturityDate = new Date(dto.maturityDate);
    if (maturityDate <= startDate) {
      throw new BadRequestException("maturityDate must be later than startDate");
    }

    const computedMaturityAmount =
      dto.maturityAmount ?? this.calculateMaturityAmount(dto.amount, dto.interestRate, startDate, maturityDate);

    return this.prisma.investment.create({
      data: {
        bankName: dto.bankName.trim(),
        investmentType: dto.investmentType.trim(),
        amount: dto.amount,
        interestRate: dto.interestRate,
        startDate,
        maturityDate,
        maturityAmount: computedMaturityAmount
      }
    });
  }

  async renew(currentUser: RequestUser, id: string, dto: RenewInvestmentDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot renew investments");
    }

    const existing = await this.prisma.investment.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException("Investment not found");
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.maturityDate;
    const maturityDate = new Date(dto.maturityDate);
    if (maturityDate <= startDate) {
      throw new BadRequestException("maturityDate must be later than startDate");
    }

    const amount = dto.amount ?? Number(existing.amount);
    const interestRate = dto.interestRate ?? Number(existing.interestRate);
    const maturityAmount = this.calculateMaturityAmount(amount, interestRate, startDate, maturityDate);

    return this.prisma.investment.update({
      where: { id },
      data: {
        amount,
        interestRate,
        startDate,
        maturityDate,
        maturityAmount,
        withdrawnDate: null
      }
    });
  }

  async withdraw(currentUser: RequestUser, id: string, dto: WithdrawInvestmentDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot withdraw investments");
    }

    const existing = await this.prisma.investment.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new NotFoundException("Investment not found");
    }

    return this.prisma.investment.update({
      where: { id },
      data: {
        withdrawnDate: dto.withdrawnDate ? new Date(dto.withdrawnDate) : new Date(),
        maturityAmount: dto.maturityAmount ?? existing.maturityAmount
      }
    });
  }

  private calculateMaturityAmount(amount: number, annualRate: number, startDate: Date, maturityDate: Date): number {
    const days = Math.max(1, (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearFraction = days / 365;
    const maturity = amount * (1 + (annualRate / 100) * yearFraction);
    return Number(maturity.toFixed(2));
  }
}
