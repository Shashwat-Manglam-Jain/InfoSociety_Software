import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaService } from "../../common/database/prisma.service";
import { getDefaultAllowedModules } from "../banking/shared/module-access";
import { updateUserAllowedModules } from "../../common/database/user-module-access";

@Injectable()
export class PlatformSuperAdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(PlatformSuperAdminBootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.ensurePlatformSuperAdmin();
  }

  async ensurePlatformSuperAdmin() {
    const configuredUsername = this.configService.get<string>("PLATFORM_SUPERADMIN_USERNAME")?.trim().toLowerCase();
    const configuredPassword = this.configService.get<string>("PLATFORM_SUPERADMIN_PASSWORD")?.trim();
    const configuredFullName =
      this.configService.get<string>("PLATFORM_SUPERADMIN_FULL_NAME")?.trim() || "Platform Superadmin";

    if (!configuredUsername || !configuredPassword) {
      this.logger.warn(
        "Platform superadmin bootstrap skipped. Set PLATFORM_SUPERADMIN_USERNAME and PLATFORM_SUPERADMIN_PASSWORD to provision the backend admin."
      );
      return;
    }

    const userWithConfiguredUsername = await this.prisma.user.findUnique({
      where: { username: configuredUsername },
      select: {
        id: true,
        username: true,
        role: true
      }
    });

    if (userWithConfiguredUsername && userWithConfiguredUsername.role !== UserRole.SUPER_ADMIN) {
      this.logger.error(
        `Platform superadmin bootstrap failed: username "${configuredUsername}" is already assigned to a non-superadmin account.`
      );
      return;
    }

    const existingSuperAdmin =
      userWithConfiguredUsername ??
      (await this.prisma.user.findFirst({
        where: { role: UserRole.SUPER_ADMIN },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          username: true,
          role: true
        }
      }));

    const passwordHash = await hash(configuredPassword, 10);
    const defaultModules = getDefaultAllowedModules(UserRole.SUPER_ADMIN);

    if (existingSuperAdmin) {
      await this.prisma.user.update({
        where: { id: existingSuperAdmin.id },
        data: {
          username: configuredUsername,
          passwordHash,
          fullName: configuredFullName,
          role: UserRole.SUPER_ADMIN,
          isActive: true,
          societyId: null,
          customerId: null,
          branchId: null,
          requiresPasswordChange: false
        }
      });
      await this.updateAllowedModules(existingSuperAdmin.id, defaultModules);

      this.logger.log(`Platform superadmin ensured from env for username "${configuredUsername}".`);
      return;
    }

    const created = await this.prisma.user.create({
      data: {
        username: configuredUsername,
        passwordHash,
        fullName: configuredFullName,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        requiresPasswordChange: false
      },
      select: {
        id: true
      }
    });
    await this.updateAllowedModules(created.id, defaultModules);

    this.logger.log(`Platform superadmin created from env for username "${configuredUsername}".`);
  }

  private async updateAllowedModules(userId: string, allowedModuleSlugs: string[]) {
    await updateUserAllowedModules(this.prisma, userId, allowedModuleSlugs);
  }
}
