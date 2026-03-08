import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { CreateSocietyDto } from "./dto/create-society.dto";
import { MonitoringService } from "./monitoring.service";

@ApiTags("monitoring")
@ApiBearerAuth()
@Controller("monitoring")
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  getModuleOverview() {
    return this.monitoringService.getModuleOverview();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("workflows")
  getWorkflows() {
    return this.monitoringService.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER)
  @Post("societies")
  createSociety(@Body() dto: CreateSocietyDto) {
    return this.monitoringService.createSociety(dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("societies")
  listSocieties(@Req() req: Request & { user: RequestUser }) {
    return this.monitoringService.listSocieties(req.user);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get("overview")
  getSocietyOverview(@Req() req: Request & { user: RequestUser }) {
    return this.monitoringService.getOverview(req.user);
  }
}
