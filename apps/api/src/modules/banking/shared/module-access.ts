import { UserRole } from "@prisma/client";

export const moduleAccessByRole: Record<UserRole, string[]> = {
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
  SUPER_USER: [
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
  SUPER_ADMIN: ["monitoring", "users", "reports"]
};

const requiredModuleAccessByRole: Record<UserRole, string[]> = {
  CLIENT: ["customers"],
  AGENT: [],
  SUPER_USER: [],
  SUPER_ADMIN: []
};

export function getDefaultAllowedModules(role: UserRole) {
  return moduleAccessByRole[role] ?? [];
}

export function getRequiredAllowedModules(role: UserRole) {
  return requiredModuleAccessByRole[role] ?? [];
}

export function sanitizeAllowedModules(role: UserRole, requestedModules?: string[] | null) {
  const allowedUniverse = new Set(getDefaultAllowedModules(role));
  const requiredModules = getRequiredAllowedModules(role).filter((entry) => allowedUniverse.has(entry));

  if (!requestedModules?.length) {
    return Array.from(new Set([...allowedUniverse, ...requiredModules]));
  }

  const normalized = requestedModules
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .filter((entry) => allowedUniverse.has(entry));

  const merged = normalized.length ? normalized : Array.from(allowedUniverse);
  return Array.from(new Set([...merged, ...requiredModules]));
}
