import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { PlatformSuperAdminBootstrapService } from "./platform-superadmin-bootstrap.service";

jest.mock("bcryptjs", () => ({
  hash: jest.fn()
}));

describe("PlatformSuperAdminBootstrapService", () => {
  function buildService(config: Record<string, string | undefined> = {}) {
    const prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      $executeRaw: jest.fn()
    };

    const configService = {
      get: jest.fn((key: string) => config[key])
    };

    return {
      service: new PlatformSuperAdminBootstrapService(prisma as never, configService as never),
      prisma,
      configService
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips provisioning when required env is missing", async () => {
    const { service, prisma } = buildService({
      PLATFORM_SUPERADMIN_USERNAME: "superadmin"
    });

    await service.ensurePlatformSuperAdmin();

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("creates a platform superadmin from env when none exists", async () => {
    const { service, prisma } = buildService({
      PLATFORM_SUPERADMIN_USERNAME: "superadmin",
      PLATFORM_SUPERADMIN_PASSWORD: "Admin@123",
      PLATFORM_SUPERADMIN_FULL_NAME: "Platform Superadmin"
    });

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "user-1" });
    (hash as jest.Mock).mockResolvedValue("hashed-password");

    await service.ensurePlatformSuperAdmin();

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: "superadmin",
        passwordHash: "hashed-password",
        fullName: "Platform Superadmin",
        role: UserRole.SUPER_ADMIN,
        isActive: true,
        requiresPasswordChange: false
      }),
      select: { id: true }
    });
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("updates an existing superadmin using env values", async () => {
    const { service, prisma } = buildService({
      PLATFORM_SUPERADMIN_USERNAME: "rootadmin",
      PLATFORM_SUPERADMIN_PASSWORD: "Root@123",
      PLATFORM_SUPERADMIN_FULL_NAME: "Root Platform Admin"
    });

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      username: "superadmin",
      role: UserRole.SUPER_ADMIN
    });
    (hash as jest.Mock).mockResolvedValue("hashed-password");

    await service.ensurePlatformSuperAdmin();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: expect.objectContaining({
        username: "rootadmin",
        passwordHash: "hashed-password",
        fullName: "Root Platform Admin",
        role: UserRole.SUPER_ADMIN
      })
    });
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
