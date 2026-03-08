import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { DemandDraftsService } from "./demand-drafts.service";
import { CreateDemandDraftDto } from "./dto/create-demand-draft.dto";
import { ListDemandDraftsQueryDto } from "./dto/list-demand-drafts-query.dto";
import { UpdateDemandDraftDto } from "./dto/update-demand-draft.dto";
import { UpdateDemandDraftStatusDto } from "./dto/update-demand-draft-status.dto";

@ApiTags("demand-drafts")
@ApiBearerAuth()
@Controller("demand-drafts")
export class DemandDraftsController {
  constructor(private readonly service: DemandDraftsService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListDemandDraftsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateDemandDraftDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateDemandDraftDto
  ) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/status")
  updateStatus(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateDemandDraftStatusDto
  ) {
    return this.service.updateStatus(req.user, id, dto);
  }
}
