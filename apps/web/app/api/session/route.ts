import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "@/shared/types";
import { AUTH_SESSION_COOKIE_KEY, parseSessionPayload } from "@/shared/auth/session-payload";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(AUTH_SESSION_COOKIE_KEY)?.value;

  if (!sessionValue) {
    return NextResponse.json({ session: null });
  }

  try {
    const parsed = JSON.parse(sessionValue) as unknown;
    return NextResponse.json({ session: parseSessionPayload(parsed) });
  } catch {
    return NextResponse.json({ session: null });
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as unknown;
  const session = parseSessionPayload(payload);

  if (!session) {
    return NextResponse.json({ message: "Invalid session payload" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    AUTH_SESSION_COOKIE_KEY,
    JSON.stringify({
      ...session,
      avatarDataUrl: null
    }),
    buildCookieOptions()
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_SESSION_COOKIE_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}
