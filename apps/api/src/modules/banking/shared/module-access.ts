import { UserRole } from "@prisma/client";

export const moduleAccessByRole: Record<UserRole, string[]> = {
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

export function getDefaultAllowedModules(role: UserRole) {
  return moduleAccessByRole[role] ?? [];
}

export function sanitizeAllowedModules(role: UserRole, requestedModules?: string[] | null) {
  const allowedUniverse = new Set(getDefaultAllowedModules(role));

  if (!requestedModules?.length) {
    return Array.from(allowedUniverse);
  }

  const normalized = requestedModules
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry, index, source) => source.indexOf(entry) === index)
    .filter((entry) => allowedUniverse.has(entry));

  return normalized.length ? normalized : Array.from(allowedUniverse);
}
