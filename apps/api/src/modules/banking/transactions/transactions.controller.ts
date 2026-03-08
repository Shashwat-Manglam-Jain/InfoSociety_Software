import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { TransactionsService } from "./transactions.service";
import { CancelTransactionDto } from "./dto/cancel-transaction.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

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
  list(@Req() req: Request & { user: RequestUser }, @Query() query: ListTransactionsQueryDto) {
    return this.service.list(req.user, query);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post()
  create(@Req() req: Request & { user: RequestUser }, @Body() dto: CreateTransactionDto) {
    return this.service.create(req.user, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/pass")
  pass(@Req() req: Request & { user: RequestUser }, @Param("id") id: string) {
    return this.service.pass(req.user, id);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Patch(":id")
  update(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto
  ) {
    return this.service.update(req.user, id, dto);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post(":id/cancel")
  cancel(
    @Req() req: Request & { user: RequestUser },
    @Param("id") id: string,
    @Body() dto: CancelTransactionDto
  ) {
    return this.service.cancel(req.user, id, dto);
  }
}
