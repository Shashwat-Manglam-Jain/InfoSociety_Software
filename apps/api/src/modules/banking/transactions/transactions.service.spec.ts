import { ForbiddenException } from "@nestjs/common";
import { TransactionMode, TransactionType, UserRole } from "@prisma/client";
import { TransactionsService } from "./transactions.service";

describe("TransactionsService", () => {
  function buildService() {
    const prisma: any = {};
    prisma.account = {
      findUnique: jest.fn(),
      update: jest.fn()
    };
    prisma.transaction = {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    };
    prisma.ledgerEntry = {
      create: jest.fn()
    };
    prisma.$transaction = jest.fn((handler: (tx: unknown) => Promise<unknown>) =>
      handler({
        transaction: prisma.transaction,
        account: prisma.account,
        ledgerEntry: prisma.ledgerEntry
      })
    );
    prisma.society = {
      findUnique: jest.fn()
    };

    return {
      service: new TransactionsService(prisma as never),
      prisma
    };
  }

  it("passes transaction and updates account balance", async () => {
    const { service, prisma } = buildService();

    prisma.transaction.findUnique.mockResolvedValue({
      id: "txn-1",
      amount: 500,
      type: TransactionType.CREDIT,
      mode: TransactionMode.CASH,
      remark: "seed",
      isPassed: false,
      account: {
        id: "acc-1",
        societyId: "soc-1",
        currentBalance: 1000
      }
    });

    prisma.transaction.update.mockResolvedValue({ id: "txn-1", isPassed: true });

    await service.pass(
      {
        sub: "agent-1",
        username: "agent1",
        role: UserRole.AGENT,
        societyId: "soc-1",
        customerId: null
      },
      "txn-1"
    );

    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc-1" },
      data: { currentBalance: 1500 }
    });
    expect(prisma.ledgerEntry.create).toHaveBeenCalled();
  });

  it("rejects client transaction creation", async () => {
    const { service } = buildService();

    await expect(
      service.create(
        {
          sub: "client-1",
          username: "client1",
          role: UserRole.CLIENT,
          societyId: "soc-1",
          customerId: "cust-1"
        },
        {
          accountId: "acc-1",
          amount: 10,
          mode: TransactionMode.CASH,
          type: TransactionType.CREDIT
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
