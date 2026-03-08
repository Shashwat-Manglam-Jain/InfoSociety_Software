import { Controller, Get, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get()
  getOverviewLegacy() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("directory")
  getDirectory(@Req() req: Request & { user: RequestUser }) {
    return this.service.getDirectory(req.user);
  }
}
