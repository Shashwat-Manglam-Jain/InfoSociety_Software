import { AccountType, UserRole } from "@prisma/client";
import { AccountsService } from "./accounts.service";

describe("AccountsService", () => {
  function buildService() {
    const prisma = {
      customer: {
        findUnique: jest.fn()
      },
      account: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn()
      },
      society: {
        findUnique: jest.fn()
      },
      branch: {
        findUnique: jest.fn()
      },
      head: {
        findUnique: jest.fn()
      }
    };

    return {
      service: new AccountsService(prisma as never),
      prisma
    };
  }

  it("creates account with generated account number", async () => {
    const { service, prisma } = buildService();

    prisma.customer.findUnique.mockResolvedValue({
      id: "cust-1",
      societyId: "soc-1",
      society: { code: "SOC-HO" }
    });
    prisma.account.count.mockResolvedValue(0);
    prisma.account.findFirst.mockResolvedValue(null);
    prisma.society.findUnique.mockResolvedValue({ code: "SOC" });
    prisma.head.findUnique.mockResolvedValue({ accountCode: "101" });
    prisma.account.create.mockResolvedValue({
      id: "acc-1",
      accountNumber: "SOC00110100000001"
    });

    const result = await service.create(
      {
        sub: "agent-1",
        username: "agent1",
        role: UserRole.AGENT,
        societyId: "soc-1",
        customerId: null
      },
      {
        customerId: "cust-1",
        type: AccountType.SAVINGS,
        headId: "head-1"
      }
    );

    expect(prisma.account.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          accountNumber: "SOC00110100000001",
          customerId: "cust-1",
          headId: "head-1"
        })
      })
    );
    expect(result.id).toBe("acc-1");
  });

  it("scopes list to current client customer id", async () => {
    const { service, prisma } = buildService();

    prisma.account.findMany.mockResolvedValue([]);
    prisma.account.count.mockResolvedValue(0);

    await service.list(
      {
        sub: "client-user",
        username: "client1",
        role: UserRole.CLIENT,
        societyId: "soc-1",
        customerId: "cust-99"
      },
      {
        page: 1,
        limit: 10
      }
    );

    expect(prisma.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customerId: "cust-99"
        })
      })
    );
  });
});
