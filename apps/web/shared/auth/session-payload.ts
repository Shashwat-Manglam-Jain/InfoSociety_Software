import type { AppAccountType, LoginResponse, Session, SubscriptionPlan, UserRole } from "../types";

export const SESSION_KEY = "infopath_session";
export const AUTH_SESSION_COOKIE_KEY = "infopath_auth_session";
const DEFAULT_SOCIETY_DASHBOARD_PATH = "/dashboard/society?view=overview";
const societyDashboardPathByModulePriority: Array<{ moduleSlugs: string[]; path: string }> = [
  { moduleSlugs: ["administration"], path: "/dashboard/society?view=overview" },
  { moduleSlugs: ["customers"], path: "/dashboard/society?view=customer_workspace" },
  { moduleSlugs: ["accounts"], path: "/dashboard/society?view=account_registry" },
  { moduleSlugs: ["deposits"], path: "/dashboard/society?view=plan_catalogue" },
  { moduleSlugs: ["loans"], path: "/dashboard/society?view=loan_workspace" },
  { moduleSlugs: ["transactions"], path: "/dashboard/society?view=transaction_workspace" },
  { moduleSlugs: ["payments"], path: "/dashboard/society?view=payments_workspace" },
  { moduleSlugs: ["cheque-clearing"], path: "/dashboard/society?view=cheque_workspace" },
  { moduleSlugs: ["locker"], path: "/dashboard/society?view=locker_workspace" },
  { moduleSlugs: ["cashbook"], path: "/dashboard/society?view=ledger_workspace" },
  { moduleSlugs: ["demand-drafts"], path: "/dashboard/society?view=demand_draft_workspace" },
  { moduleSlugs: ["ibc-obc"], path: "/dashboard/society?view=ibc_obc_workspace" },
  { moduleSlugs: ["investments"], path: "/dashboard/society?view=investment_workspace" },
  { moduleSlugs: ["reports"], path: "/dashboard/society?view=report_workspace" },
  { moduleSlugs: ["users"], path: "/dashboard/society?view=directory" },
  { moduleSlugs: ["monitoring"], path: "/dashboard/society?view=monitoring_workspace" }
];

const userRoles = new Set<UserRole>(["CLIENT", "AGENT", "SUPER_USER", "SUPER_ADMIN"]);
const accountTypes = new Set<AppAccountType>(["CLIENT", "AGENT", "SOCIETY", "PLATFORM"]);
const subscriptionPlans = new Set<SubscriptionPlan>(["FREE", "PREMIUM"]);

export function inferAccountType(role: UserRole): AppAccountType {
  if (role === "SUPER_ADMIN") {
    return "PLATFORM";
  }

  return role === "SUPER_USER" ? "SOCIETY" : role;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && userRoles.has(value as UserRole);
}

function isAccountType(value: unknown): value is AppAccountType {
  return typeof value === "string" && accountTypes.has(value as AppAccountType);
}

function isSubscriptionPlan(value: unknown): value is SubscriptionPlan {
  return typeof value === "string" && subscriptionPlans.has(value as SubscriptionPlan);
}

export function parseSessionPayload(payload: unknown): Session | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const parsed = payload as Partial<Session>;

  if (!parsed.accessToken || !parsed.username || !parsed.fullName || !isUserRole(parsed.role)) {
    return null;
  }

  return {
    accessToken: parsed.accessToken,
    role: parsed.role,
    accountType: isAccountType(parsed.accountType) ? parsed.accountType : inferAccountType(parsed.role),
    username: parsed.username,
    fullName: parsed.fullName,
    societyCode: typeof parsed.societyCode === "string" ? parsed.societyCode : null,
    subscriptionPlan: isSubscriptionPlan(parsed.subscriptionPlan) ? parsed.subscriptionPlan : null,
    avatarDataUrl: typeof parsed.avatarDataUrl === "string" ? parsed.avatarDataUrl : null,
    requiresPasswordChange: Boolean(parsed.requiresPasswordChange),
    allowedModuleSlugs: Array.isArray(parsed.allowedModuleSlugs)
      ? parsed.allowedModuleSlugs.filter((entry): entry is string => typeof entry === "string")
      : [],
    selectedBranchId: typeof parsed.selectedBranchId === "string" ? parsed.selectedBranchId : null,
    selectedBranchName: typeof parsed.selectedBranchName === "string" ? parsed.selectedBranchName : null,
    selectedBranchCode: typeof parsed.selectedBranchCode === "string" ? parsed.selectedBranchCode : null
  };
}

export function parseStoredSession(value: string): Session | null {
  const candidates = [value];

  try {
    const decoded = decodeURIComponent(value);

    if (decoded !== value) {
      candidates.unshift(decoded);
    }
  } catch {
    // Ignore malformed encoding and continue with the raw string.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      const session = parseSessionPayload(parsed);

      if (session) {
        return session;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

export function buildSessionFromLoginResponse(response: LoginResponse): Session {
  return {
    accessToken: response.accessToken,
    role: response.user.role,
    accountType: inferAccountType(response.user.role),
    username: response.user.username,
    fullName: response.user.fullName,
    societyCode: response.user.society?.code ?? null,
    subscriptionPlan: response.user.subscription?.plan ?? null,
    avatarDataUrl: null,
    requiresPasswordChange: response.user.requiresPasswordChange,
    allowedModuleSlugs: response.user.allowedModuleSlugs ?? [],
    selectedBranchId: response.user.branchId ?? null,
    selectedBranchName: null,
    selectedBranchCode: null
  };
}

function getDefaultSocietyDashboardPath(allowedModuleSlugs?: string[] | null) {
  const allowed = new Set(
    Array.isArray(allowedModuleSlugs)
      ? allowedModuleSlugs.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : []
  );

  if (allowed.size === 0) {
    return DEFAULT_SOCIETY_DASHBOARD_PATH;
  }

  for (const entry of societyDashboardPathByModulePriority) {
    if (entry.moduleSlugs.some((moduleSlug) => allowed.has(moduleSlug))) {
      return entry.path;
    }
  }

  return DEFAULT_SOCIETY_DASHBOARD_PATH;
}

export function getDefaultDashboardPath(
  accountType: AppAccountType,
  requiresPasswordChange?: boolean,
  allowedModuleSlugs?: string[] | null
) {
  if (requiresPasswordChange) {
    return "/auth/change-password";
  }

  switch (accountType) {
    case "PLATFORM":
      return "/dashboard/superadmin";
    case "SOCIETY":
      return getDefaultSocietyDashboardPath(allowedModuleSlugs);
    case "AGENT":
      return "/dashboard/agent";
    case "CLIENT":
      return "/dashboard/client";
    default:
      return getDefaultSocietyDashboardPath(allowedModuleSlugs);
  }
}
