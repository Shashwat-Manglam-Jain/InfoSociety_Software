import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateStandingInstructionDto } from "./dto/create-standing-instruction.dto";
import { UpdateStandingInstructionDto } from "./dto/update-standing-instruction.dto";
import { ListStandingInstructionsQueryDto } from "./dto/list-standing-instructions-query.dto";

@Injectable()
export class StandingInstructionsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "standing-instructions",
      ...bankingFeatureMap["standing-instructions"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["standing-instructions"].workflows;
  }

  async list(currentUser: RequestUser, query: ListStandingInstructionsQueryDto) {
    const where: Prisma.StandingInstructionWhereInput = {
      societyId: currentUser.societyId!
    };

    if (query.activeOnly === "true") {
      where.isActive = true;
    }

    const [rows, total] = await Promise.all([
      this.prisma.standingInstruction.findMany({
        where,
        include: { sourceAccount: true, targetAccount: true },
        orderBy: { nextExecutionAt: "asc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.standingInstruction.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateStandingInstructionDto) {
    if (dto.sourceAccountId === dto.targetAccountId) {
      throw new BadRequestException("Source and target accounts must be different");
    }

    return this.prisma.standingInstruction.create({
      data: {
        societyId: currentUser.societyId!,
        sourceAccountId: dto.sourceAccountId,
        targetAccountId: dto.targetAccountId,
        amount: dto.amount,
        frequency: dto.frequency,
        nextExecutionAt: new Date(dto.nextExecutionAt)
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateStandingInstructionDto) {
    const existing = await this.prisma.standingInstruction.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Standing instruction not found");
    }

    if (!existing.isActive) {
      throw new BadRequestException("Cannot update an inactive standing instruction");
    }

    const data: Prisma.StandingInstructionUpdateInput = {};

    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.nextExecutionAt !== undefined) data.nextExecutionAt = new Date(dto.nextExecutionAt);

    return this.prisma.standingInstruction.update({
      where: { id },
      data
    });
  }

  async deactivate(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.standingInstruction.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Standing instruction not found");
    }

    if (!existing.isActive) {
      throw new BadRequestException("Standing instruction is already inactive");
    }

    return this.prisma.standingInstruction.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
