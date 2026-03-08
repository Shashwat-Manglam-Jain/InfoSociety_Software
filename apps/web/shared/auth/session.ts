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
    return JSON.parse(value) as Session;
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
