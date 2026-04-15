import { ConfigService } from "@nestjs/config";

const DEFAULT_COOKIE_NAME = "infopath_api_token";

function normalizeSameSite(value: string | undefined): "lax" | "strict" | "none" {
  const normalized = (value ?? "lax").trim().toLowerCase();

  if (normalized === "strict" || normalized === "none") {
    return normalized;
  }

  return "lax";
}

export function getAuthCookieName(configService: ConfigService) {
  return configService.get<string>("JWT_COOKIE_NAME")?.trim() || DEFAULT_COOKIE_NAME;
}

export function getAuthCookieOptions(configService: ConfigService) {
  const sameSite = normalizeSameSite(configService.get<string>("COOKIE_SAME_SITE"));
  const secureByEnv = (configService.get<string>("NODE_ENV") ?? "development") === "production";
  const secure = (configService.get<string>("COOKIE_SECURE") ?? String(secureByEnv)).toLowerCase() === "true";
  const maxAgeSeconds = Number(configService.get<string>("JWT_EXPIRES_IN_SECONDS") ?? "86400");
  const domain = configService.get<string>("COOKIE_DOMAIN")?.trim();

  return {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
    maxAge: Number.isFinite(maxAgeSeconds) && maxAgeSeconds > 0 ? maxAgeSeconds * 1000 : 86_400_000,
    ...(domain ? { domain } : {})
  };
}

export function parseCookieHeader(cookieHeader: string | undefined, cookieName: string) {
  if (!cookieHeader?.trim()) {
    return null;
  }

  const prefix = `${cookieName}=`;
  const segments = cookieHeader.split(";");

  for (const segment of segments) {
    const trimmed = segment.trim();

    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    const value = trimmed.slice(prefix.length);

    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  return null;
}
