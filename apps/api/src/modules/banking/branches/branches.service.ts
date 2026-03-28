import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { UserRole } from "@prisma/client";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(currentUser: RequestUser) {
    if (!currentUser.societyId && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("User is not associated with any society");
    }

    const where = currentUser.role === UserRole.SUPER_ADMIN ? {} : { societyId: currentUser.societyId ?? "" };

    return this.prisma.branch.findMany({
      where,
      orderBy: { code: "asc" }
    });
  }

  async create(
    currentUser: RequestUser,
    data: CreateBranchDto
  ) {
    if (currentUser.role !== UserRole.SUPER_USER && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException("Only society admins or platform admins can create branches");
    }

    const societyId =
      currentUser.role === UserRole.SUPER_ADMIN ? data.societyId : currentUser.societyId;

    if (!societyId) {
      throw new ForbiddenException("No society context found for branch creation");
    }

    const code = data.code.trim();
    const name = data.name.trim();

    if (!code || !name) {
      throw new ForbiddenException("Branch code and name are required");
    }

    return this.prisma.branch.create({
      data: {
        code,
        name,
        isHead: !!data.isHead,
        isActive: data.isActive ?? true,
        societyId,
        openingDate: data.openingDate ? new Date(data.openingDate) : undefined,
        contactEmail: data.contactEmail,
        contactNo: data.contactNo,
        rechargeService: !!data.rechargeService,
        neftImpsService: !!data.neftImpsService,
        ifscCode: data.ifscCode,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        lockerFacility: !!data.lockerFacility
      }
    });
  }

  async update(
    currentUser: RequestUser,
    id: string,
    data: UpdateBranchDto
  ) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) {
      throw new NotFoundException("Branch not found");
    }

    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      (!currentUser.societyId || currentUser.societyId !== branch.societyId)
    ) {
      throw new ForbiddenException("Branch belongs to another society");
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...data,
        openingDate: data.openingDate ? new Date(data.openingDate) : undefined
      }
    });
  }
}
