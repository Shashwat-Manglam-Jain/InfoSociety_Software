import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { InterestSlabsService } from "./interest-slabs.service";
import { CreateInterestSlabDto } from "./dto/create-interest-slab.dto";
import { UpdateInterestSlabDto } from "./dto/update-interest-slab.dto";
import { ListInterestSlabsQueryDto } from "./dto/list-interest-slabs-query.dto";

@ApiTags("interest-slabs")
@ApiBearerAuth()
@Controller("banking/interest-slabs")
export class InterestSlabsController {
  constructor(private readonly service: InterestSlabsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListInterestSlabsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateInterestSlabDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER)
  @Patch(":id")
  update(@Req() req: Request & { user: RequestUser }, @Param("id") id: string, @Body() dto: UpdateInterestSlabDto) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER)
  @Delete(":id")
  deactivate(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.deactivate(req.user, id);
  }
}
