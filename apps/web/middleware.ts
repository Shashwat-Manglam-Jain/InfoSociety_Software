import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_KEY, getDefaultDashboardPath, parseStoredSession } from "@/shared/auth/session-payload";

const guestOnlyRoutes = new Set(["/", "/login", "/register", "/admin"]);
const protectedPrefixes = ["/dashboard", "/auth/change-password"];

function isSocietyPortalRoute(pathname: string) {
  return /^\/[^/]+\/(agentlogin|clientlogin|stafflogin)$/.test(pathname);
}

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isGuestOnlyRoute(pathname: string) {
  return guestOnlyRoutes.has(pathname) || isSocietyPortalRoute(pathname);
}

function matchesDashboardRole(pathname: string, role: string) {
  if (pathname.startsWith("/dashboard/superadmin")) {
    return role === "SUPER_ADMIN";
  }

  if (pathname.startsWith("/dashboard/society")) {
    return role === "SUPER_USER";
  }

  if (pathname.startsWith("/dashboard/agent")) {
    return role === "AGENT";
  }

  if (pathname.startsWith("/dashboard/client")) {
    return role === "CLIENT";
  }

  return true;
}

function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_SESSION_COOKIE_KEY, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(AUTH_SESSION_COOKIE_KEY)?.value;
  const session = sessionCookie ? parseStoredSession(sessionCookie) : null;
  const hasInvalidSessionCookie = Boolean(sessionCookie && !session);

  if (!session && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);

    if (hasInvalidSessionCookie) {
      clearAuthSessionCookie(response);
    }

    return response;
  }

  if (!session) {
    const response = NextResponse.next();

    if (hasInvalidSessionCookie) {
      clearAuthSessionCookie(response);
    }

    return response;
  }

  const defaultPath = getDefaultDashboardPath(
    session.accountType,
    session.requiresPasswordChange,
    session.allowedModuleSlugs
  );

  if (isGuestOnlyRoute(pathname)) {
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  if (pathname.startsWith("/dashboard") && !matchesDashboardRole(pathname, session.role)) {
    return NextResponse.redirect(new URL(defaultPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/admin", "/auth/change-password", "/dashboard/:path*", "/:societyCode/:portal*"]
};
