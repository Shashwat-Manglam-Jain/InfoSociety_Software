import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { AdministrationService } from "./administration.service";
import { ListWorkingDaysQueryDto } from "./dto/list-working-days-query.dto";
import { RecomputeAccountDto } from "./dto/recompute-account.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { WorkingDayDto } from "./dto/working-day.dto";

@ApiTags("administration")
@ApiBearerAuth()
@Controller("administration")
export class AdministrationController {
  constructor(private readonly service: AdministrationService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("working-days")
  listWorkingDays(@Req() req: Request & { user: RequestUser }, @Query() query: ListWorkingDaysQueryDto) {
    return this.service.listWorkingDays(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("working-day/begin")
  beginWorkingDay(@Req() req: Request & { user: RequestUser }, @Body() dto: WorkingDayDto) {
    return this.service.beginWorkingDay(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("working-day/end")
  dayEnd(@Req() req: Request & { user: RequestUser }, @Body() dto: WorkingDayDto) {
    return this.service.dayEnd(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("month-end")
  monthEnd(@Req() req: Request & { user: RequestUser }, @Body() dto: WorkingDayDto) {
    return this.service.monthEnd(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("year-end")
  yearEnd(@Req() req: Request & { user: RequestUser }, @Body() dto: WorkingDayDto) {
    return this.service.yearEnd(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("users")
  listUsers(@Req() req: Request & { user: RequestUser }) {
    return this.service.listUsers(req.user);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch("users/:id/status")
  updateUserStatus(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto
  ) {
    return this.service.updateUserStatus(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("recompute/account/:id")
  recomputeAccount(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: RecomputeAccountDto
  ) {
    return this.service.recomputeAccountBalance(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("recompute/gl")
  recomputeGl(@Req() req: Request & { user: RequestUser }, @Body() dto: WorkingDayDto) {
    return this.service.recomputeGl(req.user, dto);
  }
}
