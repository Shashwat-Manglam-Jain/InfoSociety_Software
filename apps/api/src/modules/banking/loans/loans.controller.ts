import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { LoansService } from "./loans.service";
import { ApplyLoanDto } from "./dto/apply-loan.dto";
import { DisburseLoanDto } from "./dto/disburse-loan.dto";
import { ListLoansQueryDto } from "./dto/list-loans-query.dto";
import { RecoverLoanDto } from "./dto/recover-loan.dto";
import { SanctionLoanDto } from "./dto/sanction-loan.dto";
import { UpdateLoanGuarantorsDto } from "./dto/update-loan-guarantors.dto";
import { UpdateOverdueDto } from "./dto/update-overdue.dto";

@ApiTags("loans")
@ApiBearerAuth()
@Controller("loans")
export class LoansController {
  constructor(private readonly service: LoansService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListLoansQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Post("apply")
  apply(@Req() req: Request & { user: RequestUser }, @Body() dto: ApplyLoanDto) {
    return this.service.apply(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/sanction")
  sanction(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: SanctionLoanDto) {
    return this.service.sanction(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/disburse")
  disburse(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: DisburseLoanDto) {
    return this.service.disburse(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/recover")
  recover(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: RecoverLoanDto) {
    return this.service.recover(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/overdue")
  updateOverdue(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateOverdueDto
  ) {
    return this.service.updateOverdue(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/guarantors")
  updateGuarantors(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateLoanGuarantorsDto
  ) {
    return this.service.updateGuarantors(req.user, id, dto);
  }
}
