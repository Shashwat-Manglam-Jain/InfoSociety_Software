import { ConfigService } from "@nestjs/config";
import { PaymentMethod, PaymentPurpose, PaymentTransactionStatus, SocietyStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { RequestUser } from "../../common/auth/request-user.interface";
import { BillingService } from "./billing.service";

describe("BillingService", () => {
  function buildService(premiumPrice = 299) {
    const prisma = {
      society: {
        findUnique: jest.fn()
      },
      societySubscription: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      paymentTransaction: {
        create: jest.fn()
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

  const societyAdmin: RequestUser = {
    sub: "user-1",
    username: "societyadmin1",
    role: UserRole.SUPER_USER,
    societyId: "soc-1",
    customerId: null
  };

  const clientUser: RequestUser = {
    sub: "user-2",
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
    expect(result.scope).toBe("SOCIETY");
    expect(premiumPlan?.monthlyPrice).toBe(399);
  });

  it("upgrades a society to premium and records the payment transaction", async () => {
    const { service, prisma } = buildService(499);

    prisma.society.findUnique.mockResolvedValue({
      id: "soc-1",
      name: "Head Office",
      code: "SOC-HO",
      status: SocietyStatus.ACTIVE,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    });
    prisma.societySubscription.findUnique.mockResolvedValue({
      id: "soc-sub-1",
      societyId: "soc-1",
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 0,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      nextBillingDate: null,
      cancelAtPeriodEnd: false
    });
    prisma.societySubscription.update.mockResolvedValue({
      id: "soc-sub-1",
      societyId: "soc-1",
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 499,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
      cancelAtPeriodEnd: false
    });
    prisma.paymentTransaction.create.mockResolvedValue({
      id: "pay-1",
      purpose: PaymentPurpose.SUBSCRIPTION,
      method: PaymentMethod.UPI,
      status: PaymentTransactionStatus.SUCCESS,
      amount: 499,
      gatewayReference: "SUB-REF-1",
      processedAt: new Date("2026-03-01T00:00:00.000Z"),
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      remark: "Society premium activated for Head Office"
    });

    const result = await service.upgrade(societyAdmin, {
      paymentMethod: PaymentMethod.UPI
    });

    expect(prisma.societySubscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { societyId: "soc-1" },
        data: expect.objectContaining({
          plan: SubscriptionPlan.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: 499
        })
      })
    );
    expect(prisma.paymentTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          societyId: "soc-1",
          initiatedById: societyAdmin.sub,
          purpose: PaymentPurpose.SUBSCRIPTION,
          method: PaymentMethod.UPI,
          status: PaymentTransactionStatus.SUCCESS
        })
      })
    );
    expect(result.subscription.plan).toBe(SubscriptionPlan.PREMIUM);
    expect(result.subscription.scope).toBe("SOCIETY");
  });

  it("marks premium society subscription to cancel at period end", async () => {
    const { service, prisma } = buildService();

    prisma.society.findUnique.mockResolvedValue({
      id: "soc-1",
      name: "Head Office",
      code: "SOC-HO",
      status: SocietyStatus.ACTIVE,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    });
    prisma.societySubscription.findUnique.mockResolvedValue({
      id: "soc-sub-2",
      societyId: "soc-1",
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 299,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
      cancelAtPeriodEnd: false
    });
    prisma.societySubscription.update.mockResolvedValue({
      id: "soc-sub-2",
      societyId: "soc-1",
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 299,
      startsAt: new Date("2026-03-01T00:00:00.000Z"),
      nextBillingDate: new Date("2026-03-31T00:00:00.000Z"),
      cancelAtPeriodEnd: true
    });

    const result = await service.cancelPremium(societyAdmin);

    expect(result.subscription.cancelAtPeriodEnd).toBe(true);
    expect(prisma.societySubscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { societyId: "soc-1" },
        data: { cancelAtPeriodEnd: true }
      })
    );
  });

  it("creates a default free society subscription when missing", async () => {
    const { service, prisma } = buildService();

    prisma.society.findUnique.mockResolvedValue({
      id: "soc-1",
      name: "Head Office",
      code: "SOC-HO",
      status: SocietyStatus.ACTIVE,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00.000Z")
    });
    prisma.societySubscription.findUnique.mockResolvedValue(null);
    prisma.societySubscription.create.mockResolvedValue({
      id: "soc-sub-3",
      societyId: "soc-1",
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      monthlyPrice: 0,
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
      nextBillingDate: null,
      cancelAtPeriodEnd: false
    });

    const result = await service.getMySubscription(clientUser);

    expect(prisma.societySubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          societyId: "soc-1",
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          monthlyPrice: 0
        })
      })
    );
    expect(result.plan).toBe(SubscriptionPlan.FREE);
    expect(result.scope).toBe("SOCIETY");
  });
});
