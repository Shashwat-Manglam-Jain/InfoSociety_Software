import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DividendStatus, Prisma, ShareStatus } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { DeclareDividendDto } from "./dto/declare-dividend.dto";
import { ListDividendsQueryDto } from "./dto/list-dividends-query.dto";

@Injectable()
export class DividendsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "dividends",
      ...bankingFeatureMap["dividends"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["dividends"].workflows;
  }

  async list(currentUser: RequestUser, query: ListDividendsQueryDto) {
    const where: Prisma.DividendDeclarationWhereInput = {
      societyId: currentUser.societyId!
    };

    if (query.status) {
      where.status = query.status as DividendStatus;
    }

    const [rows, total] = await Promise.all([
      this.prisma.dividendDeclaration.findMany({
        where,
        include: { financialYear: true },
        orderBy: { declaredAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.dividendDeclaration.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async declare(currentUser: RequestUser, dto: DeclareDividendDto) {
    return this.prisma.dividendDeclaration.create({
      data: {
        societyId: currentUser.societyId!,
        financialYearId: dto.financialYearId,
        ratePercent: dto.ratePercent
      }
    });
  }

  async approve(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.dividendDeclaration.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Dividend declaration not found");
    }

    if (existing.status !== DividendStatus.DECLARED) {
      throw new BadRequestException("Only DECLARED dividends can be approved");
    }

    return this.prisma.dividendDeclaration.update({
      where: { id },
      data: { status: DividendStatus.APPROVED }
    });
  }

  async processPayouts(currentUser: RequestUser, id: string) {
    const declaration = await this.prisma.dividendDeclaration.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!declaration) {
      throw new NotFoundException("Dividend declaration not found");
    }

    if (declaration.status !== DividendStatus.APPROVED) {
      throw new BadRequestException("Only APPROVED dividends can be processed for payouts");
    }

    const activeShares = await this.prisma.shareRegister.findMany({
      where: {
        societyId: currentUser.societyId!,
        status: ShareStatus.ACTIVE
      }
    });

    if (activeShares.length === 0) {
      throw new BadRequestException("No active share register entries found for this society");
    }

    const ratePercent = Number(declaration.ratePercent);
    let totalAmount = 0;

    const payoutData = activeShares.map((share) => {
      const amount = share.sharesHeld * Number(share.faceValue) * (ratePercent / 100);
      const roundedAmount = Number(amount.toFixed(2));
      totalAmount += roundedAmount;

      return {
        declarationId: id,
        customerId: share.customerId,
        sharesHeld: share.sharesHeld,
        amount: roundedAmount
      };
    });

    await this.prisma.$transaction([
      this.prisma.dividendPayout.createMany({ data: payoutData }),
      this.prisma.dividendDeclaration.update({
        where: { id },
        data: {
          status: DividendStatus.PAID,
          totalAmount: Number(totalAmount.toFixed(2))
        }
      })
    ]);

    return {
      declarationId: id,
      payoutsCreated: payoutData.length,
      totalAmount: Number(totalAmount.toFixed(2))
    };
  }

  async listPayouts(currentUser: RequestUser, declarationId: string) {
    const declaration = await this.prisma.dividendDeclaration.findFirst({
      where: { id: declarationId, societyId: currentUser.societyId! }
    });

    if (!declaration) {
      throw new NotFoundException("Dividend declaration not found");
    }

    const payouts = await this.prisma.dividendPayout.findMany({
      where: { declarationId },
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    });

    return { declarationId, payouts };
  }

  async cancel(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.dividendDeclaration.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Dividend declaration not found");
    }

    if (existing.status === DividendStatus.PAID) {
      throw new BadRequestException("Cannot cancel a dividend that has already been paid out");
    }

    if (existing.status === DividendStatus.CANCELLED) {
      throw new BadRequestException("Dividend is already cancelled");
    }

    return this.prisma.dividendDeclaration.update({
      where: { id },
      data: { status: DividendStatus.CANCELLED }
    });
  }
}
