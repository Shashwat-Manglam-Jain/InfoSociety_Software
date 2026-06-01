import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { DividendsService } from "./dividends.service";
import { DeclareDividendDto } from "./dto/declare-dividend.dto";
import { ListDividendsQueryDto } from "./dto/list-dividends-query.dto";

@ApiTags("dividends")
@ApiBearerAuth()
@Controller("banking/dividends")
export class DividendsController {
  constructor(private readonly service: DividendsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListDividendsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER)
  @Post()
  declare(@Req() req: Request & { user: RequestUser }, @Body() dto: DeclareDividendDto) {
    return this.service.declare(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER)
  @Patch(":id/approve")
  approve(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.approve(req.user, id);
  }

  @Roles(UserRole.SUPER_USER)
  @Post(":id/process")
  process(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.processPayouts(req.user, id);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get(":id/payouts")
  listPayouts(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.listPayouts(req.user, id);
  }

  @Roles(UserRole.SUPER_USER)
  @Post(":id/cancel")
  cancel(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.cancel(req.user, id);
  }
}
