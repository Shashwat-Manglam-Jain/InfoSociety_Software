import { Logger } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import type { PrismaService } from "./prisma.service";
import { getDefaultAllowedModules, sanitizeAllowedModules } from "../../modules/banking/shared/module-access";

type DatabaseClient = Prisma.TransactionClient | PrismaService;

const logger = new Logger("UserModuleAccess");
let allowedModulesColumnExists: boolean | null = null;
let missingColumnWarningShown = false;

function markAllowedModulesColumnMissing() {
  allowedModulesColumnExists = false;

  if (!missingColumnWarningShown) {
    missingColumnWarningShown = true;
    logger.warn(
      'Database column "User"."allowedModuleSlugs" is missing. Falling back to role defaults until migration 20260403093000_add_user_allowed_modules is applied.'
    );
  }
}

function isMissingAllowedModulesColumnError(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : undefined;
  const metaCode =
    typeof error === "object" && error !== null
      ? (error as { meta?: { code?: string; message?: string } }).meta?.code
      : undefined;
  const metaMessage =
    typeof error === "object" && error !== null
      ? (error as { meta?: { code?: string; message?: string } }).meta?.message
      : undefined;
  const message = error instanceof Error ? error.message : String(error ?? "");

  return (
    (code === "P2010" && metaCode === "42703") ||
    message.includes('allowedModuleSlugs') ||
    String(metaMessage ?? "").includes('allowedModuleSlugs')
  );
}

function markAllowedModulesColumnPresent() {
  allowedModulesColumnExists = true;
}

export async function resolveUserAllowedModules(db: DatabaseClient, userId: string, role: UserRole) {
  if (allowedModulesColumnExists === false) {
    return getDefaultAllowedModules(role);
  }

  try {
    const rows = await db.$queryRaw<Array<{ allowedModuleSlugs: string[] | null }>>(
      Prisma.sql`SELECT "allowedModuleSlugs" FROM "User" WHERE id = ${userId} LIMIT 1`
    );

    markAllowedModulesColumnPresent();
    return sanitizeAllowedModules(role, rows[0]?.allowedModuleSlugs ?? []);
  } catch (error) {
    if (isMissingAllowedModulesColumnError(error)) {
      markAllowedModulesColumnMissing();
      return getDefaultAllowedModules(role);
    }

    throw error;
  }
}

export async function updateUserAllowedModules(db: DatabaseClient, userId: string, allowedModuleSlugs: string[]) {
  if (allowedModulesColumnExists === false) {
    return;
  }

  const moduleArray =
    allowedModuleSlugs.length > 0
      ? Prisma.sql`ARRAY[${Prisma.join(allowedModuleSlugs.map((entry) => Prisma.sql`${entry}`))}]::TEXT[]`
      : Prisma.sql`ARRAY[]::TEXT[]`;

  try {
    await db.$executeRaw(
      Prisma.sql`UPDATE "User" SET "allowedModuleSlugs" = ${moduleArray} WHERE id = ${userId}`
    );
    markAllowedModulesColumnPresent();
  } catch (error) {
    if (isMissingAllowedModulesColumnError(error)) {
      markAllowedModulesColumnMissing();
      return;
    }

    throw error;
  }
}

export async function getUserAllowedModuleMap(db: DatabaseClient, userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, string[]>();
  }

  if (allowedModulesColumnExists === false) {
    return new Map<string, string[]>();
  }

  try {
    const rows = await db.$queryRaw<Array<{ id: string; allowedModuleSlugs: string[] | null }>>(
      Prisma.sql`
        SELECT id, "allowedModuleSlugs"
        FROM "User"
        WHERE id IN (${Prisma.join(userIds)})
      `
    );

    markAllowedModulesColumnPresent();
    return new Map(rows.map((entry) => [entry.id, entry.allowedModuleSlugs ?? []]));
  } catch (error) {
    if (isMissingAllowedModulesColumnError(error)) {
      markAllowedModulesColumnMissing();
      return new Map<string, string[]>();
    }

    throw error;
  }
}

export function resetUserAllowedModulesColumnCache() {
  allowedModulesColumnExists = null;
  missingColumnWarningShown = false;
}
