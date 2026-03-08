import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { ReportsService } from "./reports.service";
import { ListReportJobsQueryDto } from "./dto/list-report-jobs-query.dto";
import { RunReportDto } from "./dto/run-report.dto";

@ApiTags("reports")
@ApiBearerAuth()
@Controller("reports")
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Get("catalog")
  getCatalog() {
    return this.service.getCatalog();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("run")
  runReport(@Req() req: Request & { user: RequestUser }, @Body() dto: RunReportDto) {
    return this.service.runReport(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("jobs")
  listJobs(@Req() req: Request & { user: RequestUser }, @Query() query: ListReportJobsQueryDto) {
    return this.service.listJobs(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("jobs/:id")
  getJobById(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.getJobById(req.user, id);
  }
}
