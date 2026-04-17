import type { Session } from "../types";
import { logout as logoutFromApi } from "../api/auth";
import { getDefaultDashboardPath, parseSessionPayload, SESSION_KEY } from "./session-payload";

const SESSION_CHANGE_EVENT = "infopath:session-changed";

function emitSessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

async function syncServerSessionCookie(session: Session | null) {
  if (typeof window === "undefined") {
    return;
  }

  const method = session ? "POST" : "DELETE";

  try {
    await fetch("/api/session", {
      method,
      headers: session ? { "Content-Type": "application/json" } : undefined,
      credentials: "same-origin",
      ...(session
        ? {
            body: JSON.stringify({
              ...session,
              avatarDataUrl: null
            })
          }
        : {})
    });
  } catch {
    // Session persistence on the server should not block client-side navigation.
  }
}

function parseStoredLocalSession(value: string): Session | null {
  return parseSessionPayload(JSON.parse(value) as unknown);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = parseStoredLocalSession(value);

    if (!parsed) {
      window.sessionStorage.removeItem(SESSION_KEY);
      void syncServerSessionCookie(null);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    void syncServerSessionCookie(null);
    return null;
  }
}

export async function setSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedSession = parseSessionPayload(session);

  if (!normalizedSession) {
    await clearSession();
    return;
  }

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));
  await syncServerSessionCookie(normalizedSession);
  emitSessionChange();
}

export async function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SESSION_KEY);
  await Promise.allSettled([syncServerSessionCookie(null), logoutFromApi().catch(() => undefined)]);
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

export { getDefaultDashboardPath };
