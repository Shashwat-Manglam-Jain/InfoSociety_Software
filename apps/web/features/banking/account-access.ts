import type { BankingModule } from "./module-registry";
import type { AppAccountType, UserRole } from "@/shared/types";

const moduleAccessByAccountType: Record<AppAccountType, string[]> = {
  // Self-service members: only their own banking operations, no master data
  CLIENT: ["customers", "accounts", "deposits", "loans", "transactions", "locker"],
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

const requiredModuleSlugsByAccountType: Record<AppAccountType, string[]> = {
  CLIENT: ["customers"],
  AGENT: [],
  SOCIETY: [],
  PLATFORM: []
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

export function getRequiredModuleSlugs(accountType: AppAccountType) {
  return requiredModuleSlugsByAccountType[accountType] ?? [];
}

export function sanitizeAllowedModuleSlugs(
  accountType: AppAccountType,
  requestedModuleSlugs?: string[] | null
) {
  const allowedUniverse = new Set(getAllowedModuleSlugs(accountType));
  const requiredModuleSlugs = getRequiredModuleSlugs(accountType).filter((entry) => allowedUniverse.has(entry));

  if (!requestedModuleSlugs?.length) {
    return Array.from(new Set([...allowedUniverse, ...requiredModuleSlugs]));
  }

  const normalized = requestedModuleSlugs
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .filter((entry) => allowedUniverse.has(entry));

  const merged = normalized.length ? normalized : Array.from(allowedUniverse);
  return Array.from(new Set([...merged, ...requiredModuleSlugs]));
}

export function getAccessibleModules(
  modules: BankingModule[],
  accountType: AppAccountType,
  requestedModuleSlugs?: string[] | null
) {
  const allowed = new Set(sanitizeAllowedModuleSlugs(accountType, requestedModuleSlugs));
  return modules.filter((module) => allowed.has(module.slug));
}
