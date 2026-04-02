import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

describe("AuthService", () => {
  function buildService() {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn()
      },
      society: {
        findUnique: jest.fn()
      },
      customer: {
        count: jest.fn(),
        create: jest.fn()
      },
      subscription: {
        create: jest.fn()
      },
      $transaction: jest.fn()
    };

    const jwtService = {
      sign: jest.fn().mockReturnValue("signed-token")
    };

    const configService = {
      get: jest.fn((key: string) => {
        if (key === "JWT_SECRET") {
          return "secret";
        }

        if (key === "JWT_EXPIRES_IN_SECONDS") {
          return "86400";
        }

        return undefined;
      })
    };

    return {
      service: new AuthService(prisma as never, jwtService as never, configService as never),
      prisma,
      jwtService
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("trims username before login lookup", async () => {
    const { service, prisma, jwtService } = buildService();

    prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      username: "agent1",
      fullName: "Agent One",
      role: UserRole.AGENT,
      isActive: true,
      passwordHash: "stored-hash",
      societyId: "soc-1",
      customerId: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office" },
      customerProfile: null,
      subscription: {
        id: "sub-1",
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: new Date("2026-03-01T00:00:00.000Z"),
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      }
    });
    (compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      username: " agent1 ",
      password: "Agent@123"
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { username: "agent1" }
      })
    );
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.user.username).toBe("agent1");
  });

  it("normalizes agent registration before persistence", async () => {
    const { service, prisma } = buildService();
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue({ id: "user-2" }),
        findUnique: jest.fn()
      },
      subscription: {
        create: jest.fn().mockResolvedValue(undefined)
      }
    };

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.society.findUnique.mockResolvedValue({
      id: "soc-1",
      code: "SOC-HO",
      name: "Head Office",
      isActive: true,
      status: "ACTIVE"
    });
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));
    tx.user.findUnique.mockResolvedValue({
      id: "user-2",
      username: "agent2",
      fullName: "Agent Two",
      role: UserRole.AGENT,
      isActive: true,
      passwordHash: "hashed-password",
      societyId: "soc-1",
      customerId: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office" },
      customerProfile: null,
      subscription: {
        id: "sub-2",
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: new Date("2026-03-01T00:00:00.000Z"),
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      }
    });
    (hash as jest.Mock).mockResolvedValue("hashed-password");

    const result = await service.registerAgentSelf({
      username: " agent2 ",
      password: "Agent@123",
      fullName: "  Agent   Two ",
      societyCode: " soc-ho "
    });

    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "agent2",
          fullName: "Agent Two",
          societyId: "soc-1"
        })
      })
    );
    expect(tx.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-2",
          plan: SubscriptionPlan.FREE
        })
      })
    );
    expect(result.user.fullName).toBe("Agent Two");
  });
});
