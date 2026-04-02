import type { BankingModule } from "./module-registry";
import type { AppAccountType, UserRole } from "@/shared/types";

const moduleAccessByAccountType: Record<AppAccountType, string[]> = {
  // Self-service members: only their own banking operations, no master data
  CLIENT: ["accounts", "deposits", "loans", "transactions", "locker"],
  AGENT: [
    "customers",
    "accounts",
    "deposits",
    "loans",
    "transactions",
    "cheque-clearing",
    "demand-drafts",
    "ibc-obc",
    "cashbook",
    "reports",
    "locker"
  ],
  SOCIETY: [
    "customers",
    "accounts",
    "deposits",
    "loans",
    "transactions",
    "cheque-clearing",
    "demand-drafts",
    "ibc-obc",
    "investments",
    "locker",
    "cashbook",
    "administration",
    "reports",
    "users",
    "monitoring"
  ],
  PLATFORM: ["monitoring", "users", "reports"]
};

export function resolveAccountTypeByRole(role: UserRole): AppAccountType {
  if (role === "SUPER_ADMIN") {
    return "PLATFORM";
  }

  if (role === "SUPER_USER") {
    return "SOCIETY";
  }

  return role;
}

export function getAllowedModuleSlugs(accountType: AppAccountType) {
  return moduleAccessByAccountType[accountType];
}

export function sanitizeAllowedModuleSlugs(
  accountType: AppAccountType,
  requestedModuleSlugs?: string[] | null
) {
  const allowedUniverse = new Set(getAllowedModuleSlugs(accountType));

  if (!requestedModuleSlugs?.length) {
    return Array.from(allowedUniverse);
  }

  const normalized = requestedModuleSlugs
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .filter((entry) => allowedUniverse.has(entry));

  return normalized.length ? normalized : Array.from(allowedUniverse);
}

export function getAccessibleModules(
  modules: BankingModule[],
  accountType: AppAccountType,
  requestedModuleSlugs?: string[] | null
) {
  const allowed = new Set(sanitizeAllowedModuleSlugs(accountType, requestedModuleSlugs));
  return modules.filter((module) => allowed.has(module.slug));
}
