import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateInterestSlabDto } from "./dto/create-interest-slab.dto";
import { UpdateInterestSlabDto } from "./dto/update-interest-slab.dto";
import { ListInterestSlabsQueryDto } from "./dto/list-interest-slabs-query.dto";

@Injectable()
export class InterestSlabsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "interest-slabs",
      ...bankingFeatureMap["interest-slabs"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["interest-slabs"].workflows;
  }

  async list(currentUser: RequestUser, query: ListInterestSlabsQueryDto) {
    const where: Prisma.InterestSlabWhereInput = {
      societyId: currentUser.societyId!
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.activeOnly === "true") {
      where.isActive = true;
    }

    const [rows, total] = await Promise.all([
      this.prisma.interestSlab.findMany({
        where,
        orderBy: { effectiveFrom: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.interestSlab.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateInterestSlabDto) {
    return this.prisma.interestSlab.create({
      data: {
        societyId: currentUser.societyId!,
        category: dto.category.trim(),
        minAmount: dto.minAmount,
        maxAmount: dto.maxAmount ?? null,
        minDays: dto.minDays ?? 0,
        maxDays: dto.maxDays ?? null,
        ratePercent: dto.ratePercent,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date()
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateInterestSlabDto) {
    const existing = await this.prisma.interestSlab.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Interest slab not found");
    }

    if (!existing.isActive) {
      throw new BadRequestException("Cannot update an inactive interest slab");
    }

    const data: Prisma.InterestSlabUpdateInput = {};

    if (dto.category !== undefined) data.category = dto.category.trim();
    if (dto.minAmount !== undefined) data.minAmount = dto.minAmount;
    if (dto.maxAmount !== undefined) data.maxAmount = dto.maxAmount;
    if (dto.minDays !== undefined) data.minDays = dto.minDays;
    if (dto.maxDays !== undefined) data.maxDays = dto.maxDays;
    if (dto.ratePercent !== undefined) data.ratePercent = dto.ratePercent;
    if (dto.effectiveFrom !== undefined) data.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo !== undefined) data.effectiveTo = new Date(dto.effectiveTo);

    return this.prisma.interestSlab.update({
      where: { id },
      data
    });
  }

  async deactivate(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.interestSlab.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Interest slab not found");
    }

    if (!existing.isActive) {
      throw new BadRequestException("Interest slab is already inactive");
    }

    return this.prisma.interestSlab.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
