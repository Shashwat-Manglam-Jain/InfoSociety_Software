import { ConfigService } from "@nestjs/config";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { RequestUser } from "../../common/auth/request-user.interface";
import { BillingService } from "./billing.service";

describe("BillingService", () => {
  function buildService(premiumPrice = 299) {
    const prisma = {
      user: {
        findUnique: jest.fn()
      },
      subscription: {
        create: jest.fn(),
        update: jest.fn()
      }
    };

    const configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === "PREMIUM_MONTHLY_PRICE") {
          return String(premiumPrice);
        }
        return undefined;
      })
    };

    return {
      service: new BillingService(prisma as never, configService as never as ConfigService),
      prisma
    };
  }

  const clientUser: RequestUser = {
    sub: "user-1",
    username: "client1",
    role: UserRole.CLIENT,
    societyId: "soc-1",
    customerId: "cust-1"
  };

  it("returns free and premium plans from configuration", () => {
    const { service } = buildService(399);

    const result = service.getPlans();
    const premiumPlan = result.plans.find((plan) => plan.id === SubscriptionPlan.PREMIUM);

    expect(result.currency).toBe("INR");
    expect(premiumPlan?.monthlyPrice).toBe(399);
  });

  it("upgrades a free user to premium and sets the next billing date", async () => {
    const { service, prisma } = buildService(499);

    prisma.user.findUnique.mockResolvedValue({
      id: clientUser.sub,
      role: UserRole.CLIENT,
      subscription: {
        id: "sub-1",
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: new Date("2026-01-01T00:00:00.000Z"),
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      }
    });

    prisma.subscription.update.mockResolvedValue({
      id: "sub-1",
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 499,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
      cancelAtPeriodEnd: false
    });

    const result = await service.upgrade(clientUser);

    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: clientUser.sub },
        data: expect.objectContaining({
          plan: SubscriptionPlan.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: 499,
          cancelAtPeriodEnd: false
        })
      })
    );
    expect(result.subscription.plan).toBe(SubscriptionPlan.PREMIUM);
    expect(result.subscription.monthlyPrice).toBe(499);
  });

  it("marks premium subscription to cancel at period end", async () => {
    const { service, prisma } = buildService();

    prisma.user.findUnique.mockResolvedValue({
      id: clientUser.sub,
      role: UserRole.CLIENT,
      subscription: {
        id: "sub-2",
        plan: SubscriptionPlan.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 299,
        startsAt: new Date("2026-03-01T00:00:00.000Z"),
        nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
        cancelAtPeriodEnd: false
      }
    });

    prisma.subscription.update.mockResolvedValue({
      id: "sub-2",
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 299,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
      cancelAtPeriodEnd: true
    });

    const result = await service.cancelPremium(clientUser);

    expect(result.subscription.cancelAtPeriodEnd).toBe(true);
    expect(prisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: clientUser.sub },
        data: { cancelAtPeriodEnd: true }
      })
    );
  });

  it("creates a default free subscription when missing", async () => {
    const { service, prisma } = buildService();

    prisma.user.findUnique.mockResolvedValue({
      id: clientUser.sub,
      role: UserRole.CLIENT,
      subscription: null
    });

    prisma.subscription.create.mockResolvedValue({
      id: "sub-3",
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 0,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: null,
      cancelAtPeriodEnd: false
    });

    const result = await service.getMySubscription(clientUser);

    expect(prisma.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: clientUser.sub,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: 0
        })
      })
    );
    expect(result.plan).toBe(SubscriptionPlan.FREE);
  });
});
