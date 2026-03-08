import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { DepositsService } from "./deposits.service";
import { CreateDepositSchemeDto } from "./dto/create-deposit-scheme.dto";
import { ListDepositsQueryDto } from "./dto/list-deposits-query.dto";
import { OpenDepositAccountDto } from "./dto/open-deposit-account.dto";
import { RenewDepositDto } from "./dto/renew-deposit.dto";
import { UpdateDepositLienDto } from "./dto/update-deposit-lien.dto";

@ApiTags("deposits")
@ApiBearerAuth()
@Controller("deposits")
export class DepositsController {
  constructor(private readonly service: DepositsService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("schemes")
  getSchemes() {
    return this.service.getSchemes();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("schemes")
  createScheme(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateDepositSchemeDto) {
    return this.service.createScheme(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListDepositsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("open")
  open(@Req() req: Request & { user: RequestUser }, @Body() dto: OpenDepositAccountDto) {
    return this.service.open(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/renew")
  renew(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: RenewDepositDto) {
    return this.service.renew(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/lien")
  updateLien(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateDepositLienDto
  ) {
    return this.service.updateLien(req.user, id, dto);
  }
}
