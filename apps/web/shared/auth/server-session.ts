import { cookies } from "next/headers";
import type { Session } from "@/shared/types";
import { AUTH_SESSION_COOKIE_KEY, parseStoredSession } from "./session-payload";

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_SESSION_COOKIE_KEY)?.value;

  if (!cookieValue) {
    return null;
  }

  return parseStoredSession(cookieValue);
}
