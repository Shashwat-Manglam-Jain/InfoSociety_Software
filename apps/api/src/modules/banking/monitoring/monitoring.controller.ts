import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { CreateSocietyDto } from "./dto/create-society.dto";
import { UpdateSocietyAccessDto } from "./dto/update-society-access.dto";
import { MonitoringService } from "./monitoring.service";

@ApiTags("monitoring")
@ApiBearerAuth()
@Controller("monitoring")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  getModuleOverview() {
    return this.monitoringService.getModuleOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("workflows")
  getWorkflows() {
    return this.monitoringService.getWorkflows();
  }

  @Roles(UserRole.SUPER_ADMIN)
  @Post("societies")
  createSociety(@Body() dto: CreateSocietyDto, @Req() req: Request & { user: RequestUser }) {
    return this.monitoringService.createSociety(dto, req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Patch("societies/:id/access")
  updateSocietyAccess(
    @Param("id") id: string,
    @Body() dto: UpdateSocietyAccessDto,
    @Req() req: Request & { user: RequestUser }
  ) {
    return this.monitoringService.updateSocietyAccess(id, dto, req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("societies")
  listSocieties(@Req() req: Request & { user: RequestUser }) {
    return this.monitoringService.listSocieties(req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT)
  @Get("overview")
  getSocietyOverview(@Req() req: Request & { user: RequestUser }) {
    return this.monitoringService.getOverview(req.user);
  }
}
