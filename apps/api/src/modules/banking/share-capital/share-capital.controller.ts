import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { ShareCapitalService } from "./share-capital.service";
import { CreateShareDto } from "./dto/create-share.dto";
import { UpdateShareDto } from "./dto/update-share.dto";
import { ListSharesQueryDto } from "./dto/list-shares-query.dto";

@ApiTags("share-capital")
@ApiBearerAuth()
@Controller("banking/share-capital")
export class ShareCapitalController {
  constructor(private readonly service: ShareCapitalService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListSharesQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateShareDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: UpdateShareDto) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/surrender")
  surrender(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.surrender(req.user, id);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/forfeit")
  forfeit(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.forfeit(req.user, id);
  }
}
