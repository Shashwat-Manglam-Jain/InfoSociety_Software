import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { FinancialYearsService } from "./financial-years.service";
import { CreateFinancialYearDto } from "./dto/create-financial-year.dto";

@ApiTags("financial-years")
@ApiBearerAuth()
@Controller("banking/financial-years")
export class FinancialYearsController {
  constructor(private readonly service: FinancialYearsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER)
  @Get()
  list(@Req() req: Request & { user: RequestUser }) {
    return this.service.list(req.user);
  }

  @Roles(UserRole.SUPER_USER)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateFinancialYearDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER)
  @Get(":id")
  getOne(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.getOne(req.user, id);
  }

  @Roles(UserRole.SUPER_USER)
  @Post(":id/close")
  close(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.close(req.user, id);
  }
}
