import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SocietyStatus, UserRole } from "@prisma/client";
import { Request } from "express";
import { moduleAccessByRole } from "../../modules/banking/shared/module-access";
import { resolveUserAllowedModules } from "../database/user-module-access";
import { PrismaService } from "../database/prisma.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { RequestUser } from "./request-user.interface";

const guardedModuleSlugs = new Set(Object.values(moduleAccessByRole).flat());

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    const account = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        isActive: true,
        society: {
          select: {
            code: true,
            isActive: true,
            status: true
          }
        }
      }
    });

    if (!account) {
      throw new UnauthorizedException("User account not found");
    }

    if (!account.isActive) {
      throw new ForbiddenException("User account is deactivated");
    }

    if (account.society && (!account.society.isActive || account.society.status !== SocietyStatus.ACTIVE)) {
      if (account.society.status === SocietyStatus.PENDING) {
        throw new ForbiddenException("Society access is pending platform approval");
      }

      throw new ForbiddenException("Society access is currently disabled");
    }

    const allowedModuleSlugs = await this.resolveUserAllowedModules(user.sub, user.role);
    request.user = {
      ...user,
      allowedModuleSlugs
    };

    const moduleSlug = this.extractModuleSlug(request);

    if (!moduleSlug || !guardedModuleSlugs.has(moduleSlug)) {
      return true;
    }

    if (!allowedModuleSlugs.includes(moduleSlug)) {
      throw new ForbiddenException(`Access to the ${moduleSlug} module is not assigned to this user`);
    }

    return true;
  }

  private extractModuleSlug(request: Request) {
    const pathname = (request.originalUrl ?? request.url ?? "").split("?")[0].replace(/^\/+/, "");
    const segments = pathname.split("/").filter(Boolean);
    const offset = segments[0] === "api" && segments[1] === "v1" ? 2 : 0;

    return segments[offset] ?? null;
  }

  private async resolveUserAllowedModules(userId: string, role: UserRole) {
    return resolveUserAllowedModules(this.prisma, userId, role);
  }
}
