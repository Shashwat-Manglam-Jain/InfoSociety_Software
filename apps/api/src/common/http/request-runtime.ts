import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

type RateLimitRule = {
  maxRequests: number;
  pathPattern: RegExp;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.ip || request.socket.remoteAddress || "unknown";
}

function parseInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? String(fallback));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function applyRequestRuntime(
  expressApp: {
    use(handler: (request: Request, response: Response, next: () => void) => void): void;
  },
  configService: ConfigService,
  logger: Logger
) {
  const rateLimitBuckets = new Map<string, RateLimitBucket>();
  const authWindowMs = parseInteger(configService.get<string>("RATE_LIMIT_AUTH_WINDOW_MS"), 60_000);
  const authMaxRequests = parseInteger(configService.get<string>("RATE_LIMIT_AUTH_MAX_REQUESTS"), 10);
  const defaultWindowMs = parseInteger(configService.get<string>("RATE_LIMIT_DEFAULT_WINDOW_MS"), 60_000);
  const defaultMaxRequests = parseInteger(configService.get<string>("RATE_LIMIT_DEFAULT_MAX_REQUESTS"), 240);
  const logAllRequests = (configService.get<string>("LOG_ALL_REQUESTS") ?? "false").toLowerCase() === "true";
  const rules: RateLimitRule[] = [
    {
      pathPattern: /^\/api\/v1\/auth\/(login|register\/.+)/i,
      windowMs: authWindowMs,
      maxRequests: authMaxRequests
    },
    {
      pathPattern: /^\/api\/v1\//i,
      windowMs: defaultWindowMs,
      maxRequests: defaultMaxRequests
    }
  ];

  expressApp.use((request, response, next) => {
    const requestId = randomUUID();
    const startedAt = Date.now();
    const clientId = getClientIdentifier(request);
    const matchedRule = rules.find((rule) => rule.pathPattern.test(request.originalUrl ?? request.url ?? ""));

    response.setHeader("X-Request-Id", requestId);

    if (matchedRule) {
      const bucketKey = `${clientId}:${matchedRule.pathPattern.source}`;
      const now = Date.now();
      const existingBucket = rateLimitBuckets.get(bucketKey);
      const bucket =
        existingBucket && existingBucket.resetAt > now
          ? existingBucket
          : {
              count: 0,
              resetAt: now + matchedRule.windowMs
            };

      bucket.count += 1;
      rateLimitBuckets.set(bucketKey, bucket);

      response.setHeader("X-RateLimit-Limit", String(matchedRule.maxRequests));
      response.setHeader("X-RateLimit-Remaining", String(Math.max(matchedRule.maxRequests - bucket.count, 0)));
      response.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

      if (bucket.count > matchedRule.maxRequests) {
        response.setHeader("Retry-After", String(Math.max(Math.ceil((bucket.resetAt - now) / 1000), 1)));
        response.status(429).json({
          statusCode: 429,
          message: "Too many requests. Please wait and try again.",
          requestId
        });
        return;
      }

      if (rateLimitBuckets.size > 5000) {
        Array.from(rateLimitBuckets.entries())
          .filter(([, value]) => value.resetAt <= now)
          .forEach(([key]) => rateLimitBuckets.delete(key));
      }
    }

    response.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      const statusCode = response.statusCode;
      const message = `${request.method} ${request.originalUrl ?? request.url} ${statusCode} ${durationMs}ms [${requestId}]`;

      if (statusCode >= 500) {
        logger.error(message);
        return;
      }

      if (statusCode >= 400) {
        logger.warn(message);
        return;
      }

      if (logAllRequests) {
        logger.log(message);
      }
    });

    next();
  });
}
