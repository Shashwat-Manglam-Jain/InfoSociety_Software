import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  getOverviewLegacy() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("directory")
  getDirectory(@Req() req: Request & { user: RequestUser }) {
    return this.service.getDirectory(req.user);
  }
}
