import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { AdministrationService } from "./administration.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { ListWorkingDaysQueryDto } from "./dto/list-working-days-query.dto";
import { MapAgentClientDto } from "./dto/map-agent-client.dto";
import { RecomputeAccountDto } from "./dto/recompute-account.dto";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { WorkingDayDto } from "./dto/working-day.dto";

@ApiTags("administration")
@ApiBearerAuth()
@Controller("administration")
export class AdministrationController {
  constructor(private readonly service: AdministrationService) {}

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("branches")
  createBranch(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateBranchDto) {
    return this.service.createBranch(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER)
  @Get("branches")
  listBranches(@Req() req: Request & { user: RequestUser }) {
    return this.service.listBranches(req.user);
  }

  @Roles(UserRole.SUPER_USER)
  @Get("society-agents")
  listSocietyAgents(@Req() req: Request & { user: RequestUser }) {
    return this.service.listAgents(req.user);
  }

  @Roles(UserRole.SUPER_USER)
  @Get("society-transactions")
  listSocietyTransactions(@Req() req: Request & { user: RequestUser }, @Query() query: any) {
    return this.service.listSocietyTransactions(req.user, query);
  }

  @Roles(UserRole.SUPER_USER)
  @Get("agent-performance")
  getAgentPerformance(@Req() req: Request & { user: RequestUser }) {
    return this.service.getAgentPerformance(req.user);
  }

  @Roles(UserRole.SUPER_USER)
  @Patch("society")
  @Patch("society")
  updateSociety(@Req() req: Request & { user: RequestUser }, @Body() dto: any) {
    return this.service.updateSociety(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("users")
  createUser(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateUserDto) {
    return this.service.createUser(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("agent-clients")
  mapAgentClient(@Req() req: Request & { user: RequestUser }, @Body() dto: MapAgentClientDto) {
    return this.service.mapAgentClient(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("agent-clients")
  listAgentMappings(@Req() req: Request & { user: RequestUser }) {
    return this.service.listAgentMappings(req.user);
  }

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.AGENT)
  @Get("agent-overview")
  getAgentOverview(@Req() req: Request & { user: RequestUser }) {
    return this.service.getAgentOverview(req.user);
  }

  @Roles(UserRole.SUPER_USER)
  @Get("society-overview")
  getSocietyOverview(@Req() req: Request & { user: RequestUser }) {
    return this.service.getSocietyOverview(req.user);
  }

  @Roles(UserRole.SUPER_USER, UserRole.SUPER_ADMIN, UserRole.AGENT)
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
