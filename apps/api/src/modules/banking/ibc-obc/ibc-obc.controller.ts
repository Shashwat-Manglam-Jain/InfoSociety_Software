import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { IbcObcService } from "./ibc-obc.service";
import { CreateIbcObcInstrumentDto } from "./dto/create-ibc-obc-instrument.dto";
import { ListIbcObcQueryDto } from "./dto/list-ibc-obc-query.dto";
import { UpdateIbcObcStatusDto } from "./dto/update-ibc-obc-status.dto";

@ApiTags("ibc-obc")
@ApiBearerAuth()
@Controller("ibc-obc")
export class IbcObcController {
  constructor(private readonly service: IbcObcService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListIbcObcQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateIbcObcInstrumentDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/status")
  updateStatus(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateIbcObcStatusDto
  ) {
    return this.service.updateStatus(req.user, id, dto);
  }
}
