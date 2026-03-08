import { NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { ReportsService } from "./reports.service";

describe("ReportsService", () => {
  function buildService() {
    const prisma = {
      reportJob: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn()
      }
    };

    return {
      service: new ReportsService(prisma as never),
      prisma
    };
  }

  it("throws when report is not in catalog", async () => {
    const { service } = buildService();

    await expect(
      service.runReport(
        {
          sub: "super-1",
          username: "superuser",
          role: UserRole.SUPER_USER,
          societyId: null,
          customerId: null
        },
        {
          category: "unknown-category",
          reportName: "Does Not Exist"
        }
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates and completes report job", async () => {
    const { service, prisma } = buildService();

    prisma.reportJob.create.mockResolvedValue({ id: "job-1" });
    prisma.reportJob.update.mockResolvedValue({ id: "job-1", status: "DONE" });

    const result = await service.runReport(
      {
        sub: "agent-1",
        username: "agent1",
        role: UserRole.AGENT,
        societyId: "soc-1",
        customerId: null
      },
      {
        category: "master",
        reportName: "Customer Master",
        parameters: { fromDate: "2026-01-01" }
      }
    );

    expect(prisma.reportJob.create).toHaveBeenCalled();
    expect(prisma.reportJob.update).toHaveBeenCalled();
    expect(result.id).toBe("job-1");
  });
});
