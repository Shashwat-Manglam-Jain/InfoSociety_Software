import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateFinancialYearDto } from "./dto/create-financial-year.dto";

@Injectable()
export class FinancialYearsService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "financial-years",
      ...bankingFeatureMap["financial-years"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["financial-years"].workflows;
  }

  async list(currentUser: RequestUser) {
    return this.prisma.financialYear.findMany({
      where: { societyId: currentUser.societyId! },
      orderBy: { startDate: "desc" }
    });
  }

  async create(currentUser: RequestUser, dto: CreateFinancialYearDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException("endDate must be later than startDate");
    }

    return this.prisma.financialYear.create({
      data: {
        societyId: currentUser.societyId!,
        label: dto.label.trim(),
        startDate,
        endDate
      }
    });
  }

  async getOne(currentUser: RequestUser, id: string) {
    const fy = await this.prisma.financialYear.findFirst({
      where: { id, societyId: currentUser.societyId! },
      include: { dividendDeclarations: true }
    });

    if (!fy) {
      throw new NotFoundException("Financial year not found");
    }

    return fy;
  }

  async close(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.financialYear.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Financial year not found");
    }

    if (existing.isClosed) {
      throw new BadRequestException("Financial year is already closed");
    }

    return this.prisma.financialYear.update({
      where: { id },
      data: {
        isClosed: true,
        closedAt: new Date()
      }
    });
  }
}
