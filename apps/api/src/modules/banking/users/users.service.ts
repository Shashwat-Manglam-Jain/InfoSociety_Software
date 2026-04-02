import { Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { bankingFeatureMap } from "../../shared/banking-feature-map";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { PrismaService } from "../../../common/database/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getOverview() {
    return {
      module: "users",
      ...bankingFeatureMap["users"]
    };
  }

  getWorkflows() {
    return bankingFeatureMap["users"].workflows;
  }

  async getDirectory(currentUser: RequestUser) {
    const isPlatformSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const where =
      isPlatformSuperAdmin
        ? {}
        : {
            societyId: currentUser.societyId ?? ""
          };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        branchId: true,
        society: {
          select: {
            code: true,
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
