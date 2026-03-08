import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { InvestmentsService } from "./investments.service";
import { CreateInvestmentDto } from "./dto/create-investment.dto";
import { ListInvestmentsQueryDto } from "./dto/list-investments-query.dto";
import { RenewInvestmentDto } from "./dto/renew-investment.dto";
import { WithdrawInvestmentDto } from "./dto/withdraw-investment.dto";

@ApiTags("investments")
@ApiBearerAuth()
@Controller("investments")
export class InvestmentsController {
  constructor(private readonly service: InvestmentsService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListInvestmentsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateInvestmentDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/renew")
  renew(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: RenewInvestmentDto) {
    return this.service.renew(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/withdraw")
  withdraw(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: WithdrawInvestmentDto) {
    return this.service.withdraw(req.user, id, dto);
  }
}
