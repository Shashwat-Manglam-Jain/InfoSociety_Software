import { UserRole } from "@prisma/client";
import { CashbookService } from "./cashbook.service";

describe("CashbookService", () => {
  function buildService() {
    const prisma = {
      cashBookEntry: {
        count: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn()
      }
    };

    return {
      service: new CashbookService(prisma as never),
      prisma
    };
  }

  it("scopes cashbook list to the operator society", async () => {
    const { service, prisma } = buildService();

    prisma.cashBookEntry.findMany.mockResolvedValue([]);
    prisma.cashBookEntry.count.mockResolvedValue(0);

    await service.list(
      {
        sub: "user-1",
        username: "superuser",
        role: UserRole.SUPER_USER,
        societyId: "soc-1",
        customerId: null
      },
      {
        page: 1,
        limit: 20,
        q: "cash"
      }
    );

    expect(prisma.cashBookEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdBy: {
            societyId: "soc-1"
          }
        })
      })
    );
  });

  it("marks matching day entries as posted", async () => {
    const { service, prisma } = buildService();

    prisma.cashBookEntry.updateMany.mockResolvedValue({ count: 3 });

    const result = await service.passByDate(
      {
        sub: "user-1",
        username: "agent1",
        role: UserRole.AGENT,
        societyId: "soc-1",
        customerId: null
      },
      {
        date: "2026-04-03"
      }
    );

    expect(result).toEqual({ posted: 3 });
    expect(prisma.cashBookEntry.updateMany).toHaveBeenCalled();
  });
});
