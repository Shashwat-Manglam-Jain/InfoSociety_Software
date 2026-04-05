import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { LockerService } from "./locker.service";
import { CloseLockerDto } from "./dto/close-locker.dto";
import { CreateLockerDto } from "./dto/create-locker.dto";
import { ListLockerQueryDto } from "./dto/list-locker-query.dto";
import { UpdateLockerDto } from "./dto/update-locker.dto";
import { VisitLockerDto } from "./dto/visit-locker.dto";

@ApiTags("locker")
@ApiBearerAuth()
@Controller("locker")
export class LockerController {
  constructor(private readonly service: LockerService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListLockerQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateLockerDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: UpdateLockerDto) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Post(":id/visit")
  visit(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: VisitLockerDto) {
    return this.service.visit(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/close")
  close(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: CloseLockerDto) {
    return this.service.close(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Delete(":id")
  remove(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.remove(req.user, id);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get(":id/visits")
  getVisits(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.getVisits(req.user, id);
  }
}
