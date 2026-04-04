import { SocietyStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { MonitoringService } from "./monitoring.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn()
}));

describe("MonitoringService", () => {
  function buildService() {
    const tx = {
      society: {
        create: jest.fn(),
        update: jest.fn()
      },
      user: {
        create: jest.fn(),
        findFirst: jest.fn()
      },
      $executeRaw: jest.fn().mockResolvedValue(1)
    };

    const prisma = {
      society: {
        findUnique: jest.fn()
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx))
    };

    return {
      service: new MonitoringService(prisma as never),
      prisma,
      tx
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a pending society with a generated superadmin account", async () => {
    const { service, tx } = buildService();
    (hash as jest.Mock).mockResolvedValue("hashed-admin123");

    tx.society.create.mockResolvedValue({
      id: "soc-1",
      code: "SOC-HO",
      name: "Head Office",
      status: SocietyStatus.PENDING,
      isActive: false
    });
    tx.user.create.mockResolvedValue({
      id: "user-1",
      username: "superadmin_soc_ho",
      fullName: "Head Office Superadmin",
      role: UserRole.SUPER_USER,
      requiresPasswordChange: true
    });

    const result = await service.createSociety(
      {
        code: "soc-ho",
        name: "Head Office"
      },
      {
        sub: "platform-1",
        username: "superadmin",
        role: UserRole.SUPER_ADMIN,
        societyId: null,
        customerId: null
      }
    );

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
          username: "superadmin_soc_ho",
          role: UserRole.SUPER_USER,
          requiresPasswordChange: true
        })
      })
    );
    expect(result.superAdmin).toEqual(
      expect.objectContaining({
        username: "superadmin_soc_ho",
        temporaryPassword: "admin123",
        loginSocietyCode: "SOC-HO"
      })
    );
  });

  it("returns an empty overview instead of throwing when no societies exist", async () => {
    const { service } = buildService();

    jest.spyOn(service, "listSocieties").mockResolvedValue([]);

    await expect(
      service.getOverview({
        sub: "platform-1",
        username: "superadmin",
        role: UserRole.SUPER_ADMIN,
        societyId: null,
        customerId: null
      })
    ).resolves.toEqual({
      scope: "platform",
      totals: {
        societies: 0,
        customers: 0,
        accounts: 0,
        transactions: 0,
        totalBalance: 0,
        successfulPaymentVolume: 0
      },
      userRoleBreakdown: {},
      societies: []
    });
  });

  it("provisions a recovery admin when approving a society without any society admin user", async () => {
    const { service, prisma, tx } = buildService();
    (hash as jest.Mock).mockResolvedValue("hashed-admin123");

    prisma.society.findUnique.mockResolvedValue({
      id: "soc-1",
      code: "SOC-HO"
    });
    tx.society.update.mockResolvedValue({
      id: "soc-1",
      code: "SOC-HO",
      name: "Head Office",
      status: SocietyStatus.ACTIVE,
      isActive: true,
      acceptsDigitalPayments: false,
      upiId: null
    });
    tx.user.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    tx.user.create.mockResolvedValue({
      id: "user-1",
      username: "adm_soc_ho",
      fullName: "Head Office Administrator",
      role: UserRole.SUPER_USER,
      requiresPasswordChange: true
    });

    const result = await service.updateSocietyAccess(
      "soc-1",
      {
        status: SocietyStatus.ACTIVE,
        isActive: true
      },
      {
        sub: "platform-1",
        username: "superadmin",
        role: UserRole.SUPER_ADMIN,
        societyId: null,
        customerId: null
      }
    );

    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "adm_soc_ho",
          role: UserRole.SUPER_USER,
          requiresPasswordChange: true
        })
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        status: SocietyStatus.ACTIVE,
        isActive: true,
        provisionedSuperAdmin: expect.objectContaining({
          username: "adm_soc_ho",
          temporaryPassword: "admin123",
          loginSocietyCode: "SOC-HO"
        })
      })
    );
  });
});
