import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PaymentMethod,
  PaymentPurpose,
  PaymentTransactionStatus,
  Prisma,
  SocietyStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";
import { RequestUser } from "../../common/auth/request-user.interface";
import { PrismaService } from "../../common/database/prisma.service";
import { UpgradeSubscriptionDto } from "./dto/upgrade-subscription.dto";

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
      scope: "SOCIETY",
      plans: [
        {
          id: SubscriptionPlan.FREE,
          name: "Common",
          monthlyPrice: 0,
          adsEnabled: true,
          description: "Free society plan with core workflows and sponsored dashboard placements."
        },
        {
          id: SubscriptionPlan.PREMIUM,
          name: "Premium",
          monthlyPrice: premiumPrice,
          adsEnabled: false,
          description: "Society-wide premium access with ad-free dashboards, digital collections, and better visibility."
        }
      ]
    };
  }

  async getMySubscription(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return this.getPlatformSubscription(currentUser);
    }

    const society = await this.requireSocietyMembership(currentUser);
    const subscription = await this.ensureSocietySubscription(society.id, society.createdAt);
    return this.formatSocietySubscription(subscription);
  }

  async upgrade(currentUser: RequestUser, dto: UpgradeSubscriptionDto) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return {
        message: "Platform superadmin already has full premium access",
        subscription: this.getPlatformSubscription(currentUser),
        transaction: null
      };
    }

    if (currentUser.role !== UserRole.SUPER_USER) {
      throw new ForbiddenException("Only society administrators can manage society subscriptions");
    }

    const society = await this.requireSocietyMembership(currentUser);
    const subscription = await this.ensureSocietySubscription(society.id, society.createdAt);
    const premiumPrice = this.getPremiumMonthlyPrice();
    const now = new Date();

    const upgraded = await this.prisma.societySubscription.update({
      where: { societyId: society.id },
      data: {
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: premiumPrice,
        startsAt: subscription.plan === SubscriptionPlan.PREMIUM ? subscription.startsAt : now,
        nextBillingDate: this.addDays(now, BILLING_DAYS),
        cancelAtPeriodEnd: false
      }
    });

    const transaction =
      premiumPrice > 0
        ? await this.prisma.paymentTransaction.create({
            data: {
              societyId: society.id,
              initiatedById: currentUser.sub,
              purpose: PaymentPurpose.SUBSCRIPTION,
              method: dto.paymentMethod ?? PaymentMethod.UPI,
              status: PaymentTransactionStatus.SUCCESS,
              amount: premiumPrice,
              gatewayReference: this.buildGatewayReference("SUB"),
              remark: dto.note?.trim() || `Society premium activated for ${society.name}`,
              processedAt: now
            }
          })
        : null;

    return {
      message: "Society premium plan activated",
      subscription: this.formatSocietySubscription(upgraded),
      transaction: transaction ? this.formatPaymentTransaction(transaction) : null
    };
  }

  async cancelPremium(currentUser: RequestUser) {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return {
        message: "Platform superadmin cannot cancel platform access",
        subscription: this.getPlatformSubscription(currentUser)
      };
    }

    if (currentUser.role !== UserRole.SUPER_USER) {
      throw new ForbiddenException("Only society administrators can manage society subscriptions");
    }

    const society = await this.requireSocietyMembership(currentUser);
    const subscription = await this.ensureSocietySubscription(society.id, society.createdAt);

    if (subscription.plan !== SubscriptionPlan.PREMIUM) {
      return {
        message: "Society is already on the free plan",
        subscription: this.formatSocietySubscription(subscription)
      };
    }

    const updated = await this.prisma.societySubscription.update({
      where: { societyId: society.id },
      data: {
        cancelAtPeriodEnd: true
      }
    });

    return {
      message: "Society premium cancellation scheduled for the current billing cycle",
      subscription: this.formatSocietySubscription(updated)
    };
  }

  private async requireSocietyMembership(currentUser: RequestUser) {
    if (!currentUser.societyId) {
      throw new UnauthorizedException("Society context not found for this user");
    }

    const society = await this.prisma.society.findUnique({
      where: { id: currentUser.societyId },
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!society || !society.isActive) {
      throw new UnauthorizedException("Society is not available for billing");
    }

    return society;
  }

  private async ensureSocietySubscription(societyId: string, startsAt: Date) {
    const existing = await this.prisma.societySubscription.findUnique({
      where: { societyId }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.societySubscription.create({
      data: {
        societyId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt,
        nextBillingDate: null
      }
    });
  }

  private getPlatformSubscription(currentUser: RequestUser) {
    return {
      id: `platform-${currentUser.sub}`,
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 0,
      startsAt: new Date(0),
      nextBillingDate: null,
      cancelAtPeriodEnd: false,
      scope: "PLATFORM" as const
    };
  }

  private formatSocietySubscription(subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    monthlyPrice: Prisma.Decimal | number;
    startsAt: Date;
    nextBillingDate: Date | null;
    cancelAtPeriodEnd: boolean;
  }) {
    return {
      ...this.formatSubscription(subscription),
      scope: "SOCIETY" as const
    };
  }

  private formatSubscription(subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    monthlyPrice: Prisma.Decimal | number;
    startsAt: Date;
    nextBillingDate: Date | null;
    cancelAtPeriodEnd: boolean;
  }) {
    const monthlyPrice =
      typeof subscription.monthlyPrice === "number"
        ? subscription.monthlyPrice
        : Number(subscription.monthlyPrice.toString());

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

  private formatPaymentTransaction(transaction: {
    id: string;
    purpose: PaymentPurpose;
    method: PaymentMethod;
    status: PaymentTransactionStatus;
    amount: Prisma.Decimal | number;
    gatewayReference: string;
    processedAt: Date | null;
    createdAt: Date;
    remark: string | null;
  }) {
    const amount = typeof transaction.amount === "number" ? transaction.amount : Number(transaction.amount.toString());

    return {
      id: transaction.id,
      purpose: transaction.purpose,
      method: transaction.method,
      status: transaction.status,
      amount,
      gatewayReference: transaction.gatewayReference,
      processedAt: transaction.processedAt,
      createdAt: transaction.createdAt,
      remark: transaction.remark
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

  private buildGatewayReference(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
}
