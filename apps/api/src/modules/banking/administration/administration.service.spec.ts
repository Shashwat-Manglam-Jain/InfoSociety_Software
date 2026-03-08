import { TransactionType, UserRole } from "@prisma/client";
import { AdministrationService } from "./administration.service";

describe("AdministrationService", () => {
  function buildService() {
    const prisma = {
      workingDay: {
        findMany: jest.fn(),
        count: jest.fn(),
        upsert: jest.fn()
      },
      cashBookEntry: {
        updateMany: jest.fn(),
        findMany: jest.fn()
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      account: {
        findUnique: jest.fn(),
        update: jest.fn()
      },
      transaction: {
        aggregate: jest.fn()
      }
    };

    return {
      service: new AdministrationService(prisma as never),
      prisma
    };
  }

  it("groups recompute GL totals by head code", async () => {
    const { service, prisma } = buildService();

    prisma.cashBookEntry.findMany.mockResolvedValue([
      { headCode: "H100", headName: "Savings", amount: 100, type: TransactionType.DEBIT },
      { headCode: "H100", headName: "Savings", amount: 40, type: TransactionType.CREDIT },
      { headCode: "H200", headName: "Loan", amount: 75, type: TransactionType.DEBIT }
    ]);

    const result = await service.recomputeGl(
      {
        sub: "super-1",
        username: "superuser",
        role: UserRole.SUPER_USER,
        societyId: null,
        customerId: null
      },
      {}
    );

    expect(result.heads).toEqual({
      H100: { headName: "Savings", debit: 100, credit: 40 },
      H200: { headName: "Loan", debit: 75, credit: 0 }
    });
  });
});
