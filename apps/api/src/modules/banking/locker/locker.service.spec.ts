import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { LockerStatus, LockerSize, UserRole } from "@prisma/client";
import { LockerService } from "./locker.service";

describe("LockerService", () => {
  function buildService() {
    const prisma = {
      customer: {
        findUnique: jest.fn()
      },
      locker: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      lockerVisit: {
        create: jest.fn(),
        findMany: jest.fn()
      }
    };

    return {
      service: new LockerService(prisma as never),
      prisma
    };
  }

  it("blocks clients from creating lockers", async () => {
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
          customerId: "cust-1",
          lockerNumber: "LK-001",
          size: LockerSize.MEDIUM,
          annualCharge: 1200
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("scopes locker listing to the current client profile", async () => {
    const { service, prisma } = buildService();

    prisma.locker.findMany.mockResolvedValue([]);
    prisma.locker.count.mockResolvedValue(0);

    await service.list(
      {
        sub: "client-1",
        username: "client1",
        role: UserRole.CLIENT,
        societyId: "soc-1",
        customerId: "cust-1"
      },
      {
        page: 1,
        limit: 20
      }
    );

    expect(prisma.locker.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          customerId: "cust-1"
        })
      })
    );
  });

  it("rejects visit logging for inactive lockers", async () => {
    const { service, prisma } = buildService();

    prisma.locker.findUnique.mockResolvedValue({
      id: "locker-1",
      status: LockerStatus.CLOSED,
      customer: {
        societyId: "soc-1",
        id: "cust-1"
      }
    });

    await expect(
      service.visit(
        {
          sub: "agent-1",
          username: "agent1",
          role: UserRole.AGENT,
          societyId: "soc-1",
          customerId: null
        },
        "locker-1",
        {
          remarks: "inspection"
        }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
