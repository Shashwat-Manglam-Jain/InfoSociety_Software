import type { AppAccountType, Session, SubscriptionPlan, UserRole } from "../types";

const SESSION_KEY = "infopath_session";
const SESSION_CHANGE_EVENT = "infopath:session-changed";

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

function parseStoredSession(value: string): Session | null {
  const parsed = JSON.parse(value) as Partial<Session>;

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
    avatarDataUrl: typeof parsed.avatarDataUrl === "string" ? parsed.avatarDataUrl : null
  };
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
    const parsed = parseStoredSession(value);

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
  emitSessionChange();
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
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
