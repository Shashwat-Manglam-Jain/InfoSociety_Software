import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LoanNoticeType, Prisma } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateLoanNoticeDto } from "./dto/create-loan-notice.dto";
import { ListLoanNoticesQueryDto } from "./dto/list-loan-notices-query.dto";

@Injectable()
export class LoanNoticesService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "loan-notices",
      ...bankingFeatureMap["loan-notices"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["loan-notices"].workflows;
  }

  async list(currentUser: RequestUser, query: ListLoanNoticesQueryDto) {
    const where: Prisma.LoanNoticeWhereInput = {
      loan: { account: { societyId: currentUser.societyId! } }
    };

    if (query.loanId) {
      where.loanId = query.loanId;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.noticeType) {
      where.noticeType = query.noticeType as LoanNoticeType;
    }

    const [rows, total] = await Promise.all([
      this.prisma.loanNotice.findMany({
        where,
        include: { customer: true, loan: true },
        orderBy: { issuedAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.loanNotice.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateLoanNoticeDto) {
    const loan = await this.prisma.loanAccount.findFirst({
      where: { id: dto.loanId, account: { societyId: currentUser.societyId! } }
    });

    if (!loan) {
      throw new NotFoundException("Loan account not found in this society");
    }

    return this.prisma.loanNotice.create({
      data: {
        loanId: dto.loanId,
        customerId: dto.customerId,
        noticeType: dto.noticeType,
        content: dto.content ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null
      }
    });
  }

  async deliver(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.loanNotice.findFirst({
      where: {
        id,
        loan: { account: { societyId: currentUser.societyId! } }
      }
    });

    if (!existing) {
      throw new NotFoundException("Loan notice not found");
    }

    if (existing.deliveredAt) {
      throw new BadRequestException("Loan notice has already been marked as delivered");
    }

    return this.prisma.loanNotice.update({
      where: { id },
      data: { deliveredAt: new Date() }
    });
  }
}
