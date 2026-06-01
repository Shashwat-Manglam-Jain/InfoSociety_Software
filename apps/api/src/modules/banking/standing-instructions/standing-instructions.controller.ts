import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { StandingInstructionsService } from "./standing-instructions.service";
import { CreateStandingInstructionDto } from "./dto/create-standing-instruction.dto";
import { UpdateStandingInstructionDto } from "./dto/update-standing-instruction.dto";
import { ListStandingInstructionsQueryDto } from "./dto/list-standing-instructions-query.dto";

@ApiTags("standing-instructions")
@ApiBearerAuth()
@Controller("banking/standing-instructions")
export class StandingInstructionsController {
  constructor(private readonly service: StandingInstructionsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListStandingInstructionsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateStandingInstructionDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: UpdateStandingInstructionDto) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/deactivate")
  deactivate(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.deactivate(req.user, id);
  }
}
