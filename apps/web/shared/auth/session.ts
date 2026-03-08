import type { Session } from "../types";

const SESSION_KEY = "infopath_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<Session>;

    if (!parsed.accessToken || !parsed.role || !parsed.username || !parsed.fullName) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      role: parsed.role,
      username: parsed.username,
      fullName: parsed.fullName,
      societyCode: parsed.societyCode ?? null,
      subscriptionPlan: parsed.subscriptionPlan ?? null
    };
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
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
