import type { AppAccountType, Session, SubscriptionPlan, UserRole } from "../types";

export const SESSION_KEY = "infopath_session";
const SESSION_CHANGE_EVENT = "infopath:session-changed";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

const userRoles = new Set<UserRole>(["CLIENT", "AGENT", "SUPER_USER", "SUPER_ADMIN"]);
const accountTypes = new Set<AppAccountType>(["CLIENT", "AGENT", "SOCIETY", "PLATFORM"]);
const subscriptionPlans = new Set<SubscriptionPlan>(["FREE", "PREMIUM"]);

function inferAccountType(role: UserRole): AppAccountType {
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

function emitSessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

function parseSessionPayload(payload: unknown): Session | null {
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
      : []
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

function persistSessionCookie(session: Session) {
  if (typeof document === "undefined") {
    return;
  }

  // Keep the cookie payload lean so SSR can read auth context without storing large avatars.
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      ...session,
      avatarDataUrl: null
    })
  );
  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${SESSION_KEY}=${cookieValue}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") {
    return;
  }

  const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_KEY}=; Path=/; Max-Age=0; SameSite=Lax${secureAttribute}`;
}

export function getDefaultDashboardPath(accountType: AppAccountType, requiresPasswordChange?: boolean) {
  if (requiresPasswordChange) {
    return "/auth/change-password";
  }

  switch (accountType) {
    case "PLATFORM": return "/dashboard/superadmin";
    case "SOCIETY": return "/dashboard";
    case "AGENT": return "/dashboard/agent";
    case "CLIENT": return "/dashboard/client";
    default: return "/dashboard";
  }
}

function parseStoredLocalSession(value: string): Session | null {
  return parseSessionPayload(JSON.parse(value) as unknown);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = parseStoredLocalSession(value);

    if (!parsed) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  persistSessionCookie(session);
  emitSessionChange();
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  clearSessionCookie();
  emitSessionChange();
}

export function subscribeToSession(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SESSION_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_CHANGE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_CHANGE_EVENT, listener);
  };
}
