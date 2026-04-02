import { cookies } from "next/headers";
import type { Session } from "@/shared/types";
import { parseStoredSession, SESSION_KEY } from "./session";

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_KEY)?.value;

  if (!cookieValue) {
    return null;
  }

  return parseStoredSession(cookieValue);
}
