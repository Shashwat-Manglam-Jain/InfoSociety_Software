import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { Public } from "../../common/auth/public.decorator";
import { RequestUser } from "../../common/auth/request-user.interface";
import { Roles } from "../../common/auth/roles.decorator";
import { BillingService } from "./billing.service";
import { UpgradeSubscriptionDto } from "./dto/upgrade-subscription.dto";

@ApiTags("billing")
@ApiBearerAuth()
@Controller("billing")
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Public()
  @Get("plans")
  getPlans() {
    return this.service.getPlans();
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get("me")
  getMySubscription(@Req() req: Request & { user: RequestUser }) {
    return this.service.getMySubscription(req.user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Post("upgrade")
  upgrade(@Req() req: Request & { user: RequestUser }, @Body() dto: UpgradeSubscriptionDto) {
    return this.service.upgrade(req.user, dto);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Post("cancel")
  cancel(@Req() req: Request & { user: RequestUser }) {
    return this.service.cancelPremium(req.user);
  }
}
