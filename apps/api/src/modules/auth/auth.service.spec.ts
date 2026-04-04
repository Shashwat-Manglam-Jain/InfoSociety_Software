import { SocietyStatus, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
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
        findFirst: jest.fn(),
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
      $transaction: jest.fn(),
      $queryRaw: jest.fn()
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
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["customers", "transactions"] }]);

    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      username: "agent1",
      fullName: "Agent One",
      role: UserRole.AGENT,
      isActive: true,
      passwordHash: "stored-hash",
      societyId: "soc-1",
      customerId: null,
      allowedModuleSlugs: ["customers", "transactions"],
      branch: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: SocietyStatus.ACTIVE, isActive: true },
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

    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { username: { equals: "agent1", mode: "insensitive" } },
            { username: { equals: "@agent1", mode: "insensitive" } }
          ]
        }
      })
    );
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.user.username).toBe("agent1");
    expect(result.user.allowedModuleSlugs).toEqual(["customers", "transactions"]);
  });

  it("blocks society users from login while the society is pending approval", async () => {
    const { service, prisma } = buildService();
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["administration", "users"] }]);

    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      username: "socadmin",
      fullName: "Society Admin",
      role: UserRole.SUPER_USER,
      isActive: true,
      passwordHash: "stored-hash",
      societyId: "soc-1",
      customerId: null,
      allowedModuleSlugs: ["administration", "users"],
      branch: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: SocietyStatus.PENDING, isActive: false },
      customerProfile: null,
      subscription: null
    });
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login({
        username: "socadmin",
        password: "Admin@123"
      })
    ).rejects.toThrow("Your society access is pending platform approval");
  });

  it("rejects login when the selected portal role does not match the account", async () => {
    const { service, prisma } = buildService();
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["administration", "users"] }]);

    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      username: "socadmin",
      fullName: "Society Admin",
      role: UserRole.SUPER_USER,
      isActive: true,
      passwordHash: "stored-hash",
      societyId: "soc-1",
      customerId: null,
      allowedModuleSlugs: ["administration", "users"],
      branch: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: SocietyStatus.ACTIVE, isActive: true },
      customerProfile: null,
      subscription: null
    });
    (compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login({
        username: "socadmin",
        password: "Admin@123",
        societyCode: "SOC-HO",
        expectedRole: UserRole.AGENT
      })
    ).rejects.toThrow("Selected access role does not match this account");
  });

  it("normalizes agent registration before persistence", async () => {
    const { service, prisma } = buildService();
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["customers", "accounts"] }]);
    const tx = {
      user: {
        create: jest.fn().mockResolvedValue({ id: "user-2" }),
        findUnique: jest.fn()
      },
      subscription: {
        create: jest.fn().mockResolvedValue(undefined)
      },
      $executeRaw: jest.fn().mockResolvedValue(1)
    };

    prisma.user.findFirst.mockResolvedValue(null);
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
      allowedModuleSlugs: ["customers", "accounts"],
      branch: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: SocietyStatus.ACTIVE, isActive: true },
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

  it("normalizes society usernames before creating the pending admin account", async () => {
    const { service, prisma } = buildService();
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["administration", "users"] }]);
    const tx = {
      society: {
        create: jest.fn().mockResolvedValue({
          id: "soc-1",
          code: "SOC-HO",
          name: "Head Office",
          status: SocietyStatus.PENDING,
          isActive: false
        })
      },
      user: {
        create: jest.fn().mockResolvedValue({ id: "user-3" }),
        findUnique: jest.fn()
      },
      subscription: {
        create: jest.fn().mockResolvedValue(undefined)
      },
      $executeRaw: jest.fn().mockResolvedValue(1)
    };

    prisma.user.findFirst.mockResolvedValue(null);
    prisma.society.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx));
    tx.user.findUnique.mockResolvedValue({
      id: "user-3",
      username: "socadmin",
      fullName: "Society Admin",
      role: UserRole.SUPER_USER,
      isActive: true,
      passwordHash: "hashed-password",
      societyId: "soc-1",
      customerId: null,
      allowedModuleSlugs: ["administration", "users"],
      branch: null,
      society: { id: "soc-1", code: "SOC-HO", name: "Head Office", status: SocietyStatus.PENDING, isActive: false },
      customerProfile: null,
      subscription: {
        id: "sub-3",
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        monthlyPrice: 0,
        startsAt: new Date("2026-03-01T00:00:00.000Z"),
        nextBillingDate: null,
        cancelAtPeriodEnd: false
      }
    });
    (hash as jest.Mock).mockResolvedValue("hashed-password");

    const result = await service.registerSociety({
      username: " @SocAdmin ",
      password: "Admin@123",
      fullName: "  Society   Admin ",
      societyCode: " soc-ho ",
      societyName: " Head Office "
    });

    expect(tx.society.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "SOC-HO",
          name: "Head Office",
          status: SocietyStatus.PENDING,
          isActive: false
        })
      })
    );
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "socadmin",
          fullName: "Society Admin",
          role: UserRole.SUPER_USER
        })
      })
    );
    expect(result.user.username).toBe("socadmin");
  });
});
