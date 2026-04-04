import { ExecutionContext } from "@nestjs/common";
import { SocietyStatus, UserRole } from "@prisma/client";
import { WorkspaceAccessGuard } from "./workspace-access.guard";

describe("WorkspaceAccessGuard", () => {
  function buildGuard() {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false)
    };

    const prisma = {
      user: {
        findUnique: jest.fn()
      },
      $queryRaw: jest.fn()
    };

    return {
      guard: new WorkspaceAccessGuard(reflector as never, prisma as never),
      prisma
    };
  }

  function buildContext(
    url: string,
    user = {
      sub: "user-1",
      username: "staff1",
      role: UserRole.SUPER_USER,
      societyId: "soc-1",
      customerId: null
    }
  ) {
    const request = {
      originalUrl: url,
      user
    };

    return {
      request,
      context: {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => request
        })
      } as unknown as ExecutionContext
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("blocks module access when the module is not assigned to the current user", async () => {
    const { guard, prisma } = buildGuard();
    const { context } = buildContext("/api/v1/reports/jobs");

    prisma.user.findUnique.mockResolvedValue({
      isActive: true,
      society: {
        code: "SOC-HO",
        isActive: true,
        status: SocietyStatus.ACTIVE
      }
    });
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["customers", "accounts"] }]);

    await expect(guard.canActivate(context)).rejects.toThrow("Access to the reports module is not assigned to this user");
  });

  it("blocks access for societies that are still pending approval", async () => {
    const { guard, prisma } = buildGuard();
    const { context } = buildContext("/api/v1/customers");

    prisma.user.findUnique.mockResolvedValue({
      isActive: true,
      society: {
        code: "SOC-HO",
        isActive: false,
        status: SocietyStatus.PENDING
      }
    });
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["customers"] }]);

    await expect(guard.canActivate(context)).rejects.toThrow("Society access is pending platform approval");
  });

  it("allows access when the module is assigned and the society is active", async () => {
    const { guard, prisma } = buildGuard();
    const { context, request } = buildContext("/api/v1/administration/users");

    prisma.user.findUnique.mockResolvedValue({
      isActive: true,
      society: {
        code: "SOC-HO",
        isActive: true,
        status: SocietyStatus.ACTIVE
      }
    });
    prisma.$queryRaw.mockResolvedValue([{ allowedModuleSlugs: ["administration"] }]);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect((request.user as { allowedModuleSlugs?: string[] }).allowedModuleSlugs).toEqual(["administration"]);
  });
});
