import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/database/prisma.service";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { UserRole } from "@prisma/client";

@Injectable()
export class HeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(currentUser: RequestUser, relatedType?: string) {
    if (!currentUser) {
      throw new ForbiddenException("Unauthorized");
    }

    return this.prisma.head.findMany({
      where: relatedType ? { relatedType } : {},
      orderBy: { code: "asc" }
    });
  }

  async create(
    currentUser: RequestUser,
    data: { code: string; name: string; group: string; relatedType: string; accountCode: string }
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_USER) {
      throw new ForbiddenException("Only admins can create heads");
    }

    const code = data.code.trim().toUpperCase();
    const name = data.name.trim();
    const group = data.group.trim().toUpperCase();
    const relatedType = data.relatedType.trim();
    const accountCode = data.accountCode.trim().padStart(3, "0");

    if (!code || !name || !group || !relatedType || !accountCode) {
      throw new ForbiddenException("All fields are required for head creation");
    }

    return this.prisma.head.create({
      data: { code, name, group, relatedType, accountCode }
    });
  }

  async update(
    currentUser: RequestUser,
    id: string,
    data: Partial<{ name: string; group: string; relatedType: string; accountCode: string }>
  ) {
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_USER) {
      throw new ForbiddenException("Only admins can update heads");
    }

    const existing = await this.prisma.head.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Head not found");
    }

    return this.prisma.head.update({
      where: { id },
      data: {
        ...data,
        group: data.group ? data.group.trim().toUpperCase() : undefined,
        accountCode: data.accountCode ? data.accountCode.trim().padStart(3, "0") : undefined
      }
    });
  }
}

