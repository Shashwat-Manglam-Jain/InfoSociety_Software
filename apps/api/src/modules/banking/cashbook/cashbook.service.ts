import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateCashbookEntryDto } from "./dto/create-cashbook-entry.dto";
import { ListCashbookQueryDto } from "./dto/list-cashbook-query.dto";
import { PassCashbookDateDto } from "./dto/pass-cashbook-date.dto";
import { UpdateCashbookEntryDto } from "./dto/update-cashbook-entry.dto";

@Injectable()
export class CashbookService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "cashbook",
      ...bankingFeatureMap["cashbook"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["cashbook"].workflows;
  }

  async list(currentUser: RequestUser, query: ListCashbookQueryDto) {
    this.ensureOperator(currentUser);

    const where: Prisma.CashBookEntryWhereInput = {};

    if (currentUser.role === UserRole.AGENT) {
      where.createdBy = {
        societyId: currentUser.societyId ?? ""
      };
    }

    if (currentUser.role === UserRole.SUPER_USER && query.societyCode) {
      const society = await this.prisma.society.findUnique({
        where: {
          code: query.societyCode.trim().toUpperCase()
        },
        select: {
          id: true
        }
      });
      where.createdBy = {
        societyId: society?.id ?? ""
      };
    }

    if (query.isPosted !== undefined) {
      where.isPosted = query.isPosted === "true";
    }

    if (query.date) {
      const dayStart = new Date(query.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.entryDate = {
        gte: dayStart,
        lt: dayEnd
      };
    }

    if (query.q) {
      where.OR = [
        {
          headCode: {
            contains: query.q,
            mode: "insensitive"
          }
        },
        {
          headName: {
            contains: query.q,
            mode: "insensitive"
          }
        },
        {
          remark: {
            contains: query.q,
            mode: "insensitive"
          }
        }
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.cashBookEntry.findMany({
        where,
        orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.cashBookEntry.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateCashbookEntryDto) {
    this.ensureOperator(currentUser);

    return this.prisma.cashBookEntry.create({
      data: {
        headCode: dto.headCode.trim().toUpperCase(),
        headName: dto.headName.trim(),
        amount: dto.amount,
        type: dto.type,
        mode: dto.mode,
        remark: dto.remark,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
        createdById: currentUser.sub
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateCashbookEntryDto) {
    this.ensureOperator(currentUser);

    const entry = await this.prisma.cashBookEntry.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException("Cashbook entry not found");
    }

    this.ensureEntryScope(currentUser, entry.createdBy?.societyId ?? null);

    if (entry.isPosted) {
      return this.prisma.cashBookEntry.update({
        where: { id },
        data: {
          mode: dto.mode ?? entry.mode,
          remark: dto.remark ?? entry.remark
        }
      });
    }

    return this.prisma.cashBookEntry.update({
      where: { id },
      data: dto
    });
  }

  async remove(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);

    const entry = await this.prisma.cashBookEntry.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException("Cashbook entry not found");
    }

    this.ensureEntryScope(currentUser, entry.createdBy?.societyId ?? null);

    if (entry.isPosted && currentUser.role !== UserRole.SUPER_USER) {
      throw new ForbiddenException("Posted entries can only be deleted by super user");
    }

    return this.prisma.cashBookEntry.delete({
      where: { id }
    });
  }

  async passOne(currentUser: RequestUser, id: string) {
    this.ensureOperator(currentUser);

    const entry = await this.prisma.cashBookEntry.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException("Cashbook entry not found");
    }

    this.ensureEntryScope(currentUser, entry.createdBy?.societyId ?? null);

    if (entry.isPosted) {
      return entry;
    }

    return this.prisma.cashBookEntry.update({
      where: { id },
      data: {
        isPosted: true,
        postedAt: new Date()
      }
    });
  }

  async passByDate(currentUser: RequestUser, dto: PassCashbookDateDto) {
    this.ensureOperator(currentUser);

    const date = dto.date ? new Date(dto.date) : new Date();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const where: Prisma.CashBookEntryWhereInput = {
      isPosted: false,
      entryDate: {
        gte: dayStart,
        lt: dayEnd
      }
    };

    if (currentUser.role === UserRole.AGENT) {
      where.createdBy = {
        societyId: currentUser.societyId ?? ""
      };
    }

    const result = await this.prisma.cashBookEntry.updateMany({
      where,
      data: {
        isPosted: true,
        postedAt: new Date()
      }
    });

    return {
      posted: result.count
    };
  }

  private ensureOperator(currentUser: RequestUser) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot access cashbook operations");
    }
  }

  private ensureEntryScope(currentUser: RequestUser, societyId: string | null) {
    if (currentUser.role === UserRole.SUPER_USER) {
      return;
    }

    if (societyId && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Cashbook entry belongs to another society");
    }
  }
}
