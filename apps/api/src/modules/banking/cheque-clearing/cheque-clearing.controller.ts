import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { ChequeClearingService } from "./cheque-clearing.service";
import { CreateChequeEntryDto } from "./dto/create-cheque-entry.dto";
import { ListChequeClearingQueryDto } from "./dto/list-cheque-clearing-query.dto";
import { UpdateChequeEntryDto } from "./dto/update-cheque-entry.dto";
import { UpdateChequeStatusDto } from "./dto/update-cheque-status.dto";

@ApiTags("cheque-clearing")
@ApiBearerAuth()
@Controller("cheque-clearing")
export class ChequeClearingController {
  constructor(private readonly service: ChequeClearingService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListChequeClearingQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateChequeEntryDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: UpdateChequeEntryDto) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id/status")
  updateStatus(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateChequeStatusDto
  ) {
    return this.service.updateStatus(req.user, id, dto);
  }
}
