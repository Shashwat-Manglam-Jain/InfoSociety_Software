import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { RequestUser } from "../../common/auth/request-user.interface";
import { Roles } from "../../common/auth/roles.decorator";
import { CreatePaymentRequestDto } from "./dto/create-payment-request.dto";
import { PayPaymentRequestDto } from "./dto/pay-payment-request.dto";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@ApiBearerAuth()
@Controller("payments")
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get()
  getModuleOverview() {
    return this.service.getOverviewDefinition();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("workflows")
  getWorkflows() {
    return this.service.getWorkflows();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("overview")
  getOverview(@Req() req: Request & { user: RequestUser }) {
    return this.service.getOverview(req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("requests")
  listRequests(@Req() req: Request & { user: RequestUser }) {
    return this.service.listRequests(req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Get("transactions")
  listTransactions(@Req() req: Request & { user: RequestUser }) {
    return this.service.listTransactions(req.user);
  }

  @Roles(UserRole.SUPER_USER, UserRole.AGENT)
  @Post("requests")
  createRequest(@Body() dto: CreatePaymentRequestDto, @Req() req: Request & { user: RequestUser }) {
    return this.service.createRequest(req.user, dto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER, UserRole.AGENT, UserRole.CLIENT)
  @Post("requests/:id/pay")
  payRequest(@Param("id") id: string, @Body() dto: PayPaymentRequestDto, @Req() req: Request & { user: RequestUser }) {
    return this.service.payRequest(id, req.user, dto);
  }
}
