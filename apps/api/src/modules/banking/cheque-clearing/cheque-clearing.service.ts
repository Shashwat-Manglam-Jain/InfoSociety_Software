import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InstrumentStatus, Prisma, UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateChequeEntryDto } from "./dto/create-cheque-entry.dto";
import { ListChequeClearingQueryDto } from "./dto/list-cheque-clearing-query.dto";
import { UpdateChequeEntryDto } from "./dto/update-cheque-entry.dto";
import { UpdateChequeStatusDto } from "./dto/update-cheque-status.dto";

@Injectable()
export class ChequeClearingService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "cheque-clearing",
      ...bankingFeatureMap["cheque-clearing"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["cheque-clearing"].workflows;
  }

  async list(currentUser: RequestUser, query: ListChequeClearingQueryDto) {
    const where = await this.getScopedWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      this.prisma.chequeClearing.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              societyId: true
            }
          }
        },
        orderBy: {
          entryDate: "desc"
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.chequeClearing.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateChequeEntryDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot create cheque clearing entries");
    }

    if (!dto.accountId) {
      throw new BadRequestException("accountId is required to keep cheque clearing scoped to a society");
    }

    const account = dto.accountId
      ? await this.prisma.account.findUnique({
          where: { id: dto.accountId },
          select: {
            id: true,
            societyId: true
          }
        })
      : null;

    if (dto.accountId && !account) {
      throw new NotFoundException("Account not found");
    }

    this.ensureScope(currentUser, account!.societyId);

    return this.prisma.chequeClearing.create({
      data: {
        chequeNumber: dto.chequeNumber.trim(),
        accountId: account?.id,
        bankName: dto.bankName.trim(),
        branchName: dto.branchName.trim(),
        amount: dto.amount
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateChequeEntryDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot modify cheque entries");
    }

    const entry = await this.prisma.chequeClearing.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException("Cheque clearing entry not found");
    }

    if (!entry.account?.societyId) {
      throw new BadRequestException("Unable to resolve society for this cheque entry");
    }

    this.ensureScope(currentUser, entry.account.societyId);

    if (entry.status !== InstrumentStatus.ENTERED) {
      throw new BadRequestException("Only entered cheque can be modified");
    }

    return this.prisma.chequeClearing.update({
      where: { id },
      data: dto
    });
  }

  async updateStatus(currentUser: RequestUser, id: string, dto: UpdateChequeStatusDto) {
    if (currentUser.role === UserRole.CLIENT) {
      throw new ForbiddenException("Client users cannot update cheque status");
    }

    const entry = await this.prisma.chequeClearing.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            societyId: true
          }
        }
      }
    });

    if (!entry) {
      throw new NotFoundException("Cheque clearing entry not found");
    }

    if (!entry.account?.societyId) {
      throw new BadRequestException("Unable to resolve society for this cheque entry");
    }

    this.ensureScope(currentUser, entry.account.societyId);

    return this.prisma.chequeClearing.update({
      where: { id },
      data: {
        status: dto.status,
        clearedDate: dto.status === InstrumentStatus.CLEARED ? new Date() : null
      }
    });
  }

  private async getScopedWhere(
    currentUser: RequestUser,
    query: ListChequeClearingQueryDto
  ): Promise<Prisma.ChequeClearingWhereInput> {
    const where: Prisma.ChequeClearingWhereInput = {};

    if (currentUser.role === UserRole.CLIENT) {
      where.account = {
        customerId: currentUser.customerId ?? ""
      };
    }

    if (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.SUPER_USER) {
      where.account = {
        societyId: currentUser.societyId ?? ""
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.q) {
      where.OR = [
        { chequeNumber: { contains: query.q, mode: "insensitive" } },
        { bankName: { contains: query.q, mode: "insensitive" } },
        { branchName: { contains: query.q, mode: "insensitive" } },
        { account: { accountNumber: { contains: query.q, mode: "insensitive" } } }
      ];
    }

    return where;
  }

  private ensureScope(currentUser: RequestUser, societyId: string) {
    if ((currentUser.role === UserRole.SUPER_USER || currentUser.role === UserRole.AGENT) && currentUser.societyId !== societyId) {
      throw new ForbiddenException("Entry belongs to another society");
    }
  }
}
