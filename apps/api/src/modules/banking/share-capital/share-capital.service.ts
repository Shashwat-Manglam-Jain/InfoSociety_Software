import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ShareStatus } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { UpdateShareDto } from "./dto/update-share.dto";
import { ListSharesQueryDto } from "./dto/list-shares-query.dto";

@Injectable()
export class ShareCapitalService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "share-capital",
      ...bankingFeatureMap["share-capital"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["share-capital"].workflows;
  }

  async list(currentUser: RequestUser, query: ListSharesQueryDto) {
    const where: Prisma.ShareRegisterWhereInput = {
      societyId: currentUser.societyId!
    };

    if (query.status) {
      where.status = query.status as ShareStatus;
    }

    if (query.q) {
      where.customer = {
        OR: [
          { firstName: { contains: query.q, mode: "insensitive" } },
          { lastName: { contains: query.q, mode: "insensitive" } }
        ]
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.shareRegister.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      this.prisma.shareRegister.count({ where })
    ]);

    return {
      page: query.page,
      limit: query.limit,
      total,
      rows
    };
  }

  async create(currentUser: RequestUser, dto: CreateShareDto) {
    return this.prisma.shareRegister.create({
      data: {
        societyId: currentUser.societyId!,
        customerId: dto.customerId,
        certificateNo: dto.certificateNo,
        sharesHeld: dto.sharesHeld,
        faceValue: dto.faceValue,
        paidUpValue: dto.paidUpValue
      }
    });
  }

  async update(currentUser: RequestUser, id: string, dto: UpdateShareDto) {
    const existing = await this.prisma.shareRegister.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Share register entry not found");
    }

    if (existing.status !== ShareStatus.ACTIVE) {
      throw new BadRequestException("Cannot update a non-active share entry");
    }

    return this.prisma.shareRegister.update({
      where: { id },
      data: {
        certificateNo: dto.certificateNo ?? existing.certificateNo,
        sharesHeld: dto.sharesHeld ?? existing.sharesHeld,
        faceValue: dto.faceValue ?? existing.faceValue,
        paidUpValue: dto.paidUpValue ?? existing.paidUpValue
      }
    });
  }

  async surrender(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.shareRegister.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Share register entry not found");
    }

    if (existing.status !== ShareStatus.ACTIVE) {
      throw new BadRequestException("Only active shares can be surrendered");
    }

    return this.prisma.shareRegister.update({
      where: { id },
      data: {
        status: ShareStatus.SURRENDERED,
        surrenderDate: new Date()
      }
    });
  }

  async forfeit(currentUser: RequestUser, id: string) {
    const existing = await this.prisma.shareRegister.findFirst({
      where: { id, societyId: currentUser.societyId! }
    });

    if (!existing) {
      throw new NotFoundException("Share register entry not found");
    }

    if (existing.status !== ShareStatus.ACTIVE) {
      throw new BadRequestException("Only active shares can be forfeited");
    }

    return this.prisma.shareRegister.update({
      where: { id },
      data: {
        status: ShareStatus.FORFEITED,
        surrenderDate: new Date()
      }
    });
  }
}
