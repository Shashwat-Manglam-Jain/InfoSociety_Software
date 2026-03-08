import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { RequestUser } from "../../common/auth/request-user.interface";
import { PrismaService } from "../../common/database/prisma.service";

const DEFAULT_PREMIUM_MONTHLY_PRICE = 299;
const BILLING_DAYS = 30;

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  getPlans() {
    const premiumPrice = this.getPremiumMonthlyPrice();

    return {
      currency: "INR",
      plans: [
        {
          id: SubscriptionPlan.FREE,
          name: "Common",
          monthlyPrice: 0,
          adsEnabled: true,
          description: "Free account for daily banking access with ad-supported dashboard."
        },
        {
          id: SubscriptionPlan.PREMIUM,
          name: "Premium",
          monthlyPrice: premiumPrice,
          adsEnabled: false,
          description: "Monthly paid subscription with ad-free dashboard and priority support."
        }
      ]
    };
  }

  async getMySubscription(currentUser: RequestUser) {
    const subscription = await this.ensureSubscription(currentUser);
    return this.formatSubscription(subscription);
  }

  async upgrade(currentUser: RequestUser) {
    const subscription = await this.ensureSubscription(currentUser);

    const premiumPrice = currentUser.role === UserRole.SUPER_USER ? 0 : this.getPremiumMonthlyPrice();
    const now = new Date();

    const upgraded = await this.prisma.subscription.update({
      where: { userId: currentUser.sub },
      data: {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: premiumPrice,
        startsAt: subscription.plan === SubscriptionPlan.PREMIUM ? subscription.startsAt : now,
        nextBillingDate: currentUser.role === UserRole.SUPER_USER ? null : this.addDays(now, BILLING_DAYS),
        cancelAtPeriodEnd: false
      }
    });

    return {
      message: "Premium plan activated",
      subscription: this.formatSubscription(upgraded)
    };
  }

  async cancelPremium(currentUser: RequestUser) {
    const subscription = await this.ensureSubscription(currentUser);

    if (subscription.plan !== SubscriptionPlan.PREMIUM) {
      return {
        message: "Current plan is already free",
        subscription: this.formatSubscription(subscription)
      };
    }

    const updated = await this.prisma.subscription.update({
      where: { userId: currentUser.sub },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    return {
      message: "Premium cancellation scheduled for the current billing cycle",
      subscription: this.formatSubscription(updated)
    };
  }

  private async ensureSubscription(currentUser: RequestUser) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      select: {
        id: true,
        role: true,
        subscription: true
      }
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.subscription) {
      return user.subscription;
    }

    return this.prisma.subscription.create({
      data: {
        userId: user.id,
        plan: user.role === UserRole.SUPER_USER ? SubscriptionPlan.PREMIUM : SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        nextBillingDate: null
      }
    });
  }

  private formatSubscription(subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    monthlyPrice: { toNumber(): number } | number;
    startsAt: Date;
    nextBillingDate: Date | null;
    cancelAtPeriodEnd: boolean;
  }) {
    const monthlyPrice =
      typeof subscription.monthlyPrice === "number"
        ? subscription.monthlyPrice
        : subscription.monthlyPrice.toNumber();

    return {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      monthlyPrice,
      startsAt: subscription.startsAt,
      nextBillingDate: subscription.nextBillingDate,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    };
  }

  private getPremiumMonthlyPrice() {
    const value = Number(this.configService.get<string>("PREMIUM_MONTHLY_PRICE") ?? DEFAULT_PREMIUM_MONTHLY_PRICE);
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_PREMIUM_MONTHLY_PRICE;
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
