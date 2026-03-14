import type { BankingModule } from "./module-registry";
import type { AppAccountType, UserRole } from "@/shared/types";

const moduleAccessByAccountType: Record<AppAccountType, string[]> = {
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

export function getAccessibleModules(modules: BankingModule[], accountType: AppAccountType) {
  const allowed = new Set(getAllowedModuleSlugs(accountType));
  return modules.filter((module) => allowed.has(module.slug));
}
