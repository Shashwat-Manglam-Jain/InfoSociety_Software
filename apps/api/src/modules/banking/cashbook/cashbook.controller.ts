import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { CashbookService } from "./cashbook.service";
import { CreateCashbookEntryDto } from "./dto/create-cashbook-entry.dto";
import { ListCashbookQueryDto } from "./dto/list-cashbook-query.dto";
import { PassCashbookDateDto } from "./dto/pass-cashbook-date.dto";
import { UpdateCashbookEntryDto } from "./dto/update-cashbook-entry.dto";

@ApiTags("cashbook")
@ApiBearerAuth()
@Controller("cashbook")
export class CashbookController {
  constructor(private readonly service: CashbookService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Get()
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListCashbookQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateCashbookEntryDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateCashbookEntryDto
  ) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/pass")
  passOne(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.passOne(req.user, id);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("pass-day")
  passByDate(@Req() req: Request & { user: RequestUser }, @Body() dto: PassCashbookDateDto) {
    return this.service.passByDate(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Delete(":id")
  remove(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.remove(req.user, id);
  }
}
