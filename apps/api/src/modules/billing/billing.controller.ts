import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "../../common/auth/public.decorator";
import { RequestUser } from "../../common/auth/request-user.interface";
import { BillingService } from "./billing.service";
import { UpgradeSubscriptionDto } from "./dto/upgrade-subscription.dto";

@ApiTags("billing")
@Controller("billing")
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Public()
  @Get("plans")
  getPlans() {
    return this.service.getPlans();
  }

  @ApiBearerAuth()
  @Get("me")
  getMySubscription(@Req() req: Request & { user: RequestUser }) {
    return this.service.getMySubscription(req.user);
  }

  @ApiBearerAuth()
  @Post("upgrade")
  upgrade(@Req() req: Request & { user: RequestUser }, @Body() dto: UpgradeSubscriptionDto) {
    void dto;
    return this.service.upgrade(req.user);
  }

  @ApiBearerAuth()
  @Post("cancel")
  cancel(@Req() req: Request & { user: RequestUser }) {
    return this.service.cancelPremium(req.user);
  }
}
