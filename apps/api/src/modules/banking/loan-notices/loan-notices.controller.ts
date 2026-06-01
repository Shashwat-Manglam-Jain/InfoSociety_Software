import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { LoanNoticesService } from "./loan-notices.service";
import { CreateLoanNoticeDto } from "./dto/create-loan-notice.dto";
import { ListLoanNoticesQueryDto } from "./dto/list-loan-notices-query.dto";

@ApiTags("loan-notices")
@ApiBearerAuth()
@Controller("banking/loan-notices")
export class LoanNoticesController {
  constructor(private readonly service: LoanNoticesService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListLoanNoticesQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateLoanNoticeDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/deliver")
  deliver(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.deliver(req.user, id);
  }
}
