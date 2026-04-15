# Runtime Service Map

## API

- `main.ts`
  Boots Nest, enables validation, CORS, security headers, Swagger, and the request runtime middleware.
- `common/http/request-runtime.ts`
  Adds request IDs, request logging, and in-memory rate limiting for auth and general API traffic.
- `modules/auth`
  Depends on `PrismaService`, `JwtService`, `ConfigService`, and `MemoryCacheService`.
  Owns login, registration, JWT issuing, API auth cookie handling, public society directory, and current-user profile loading.
- `modules/banking/deposits`
  Depends on `PrismaService`.
  Owns deposit plan bootstrap/catalogue CRUD and deposit-account opening/renewal/lien actions.
- `modules/billing`
  Depends on `PrismaService` and `MemoryCacheService`.
  Owns public billing plans plus society subscription reads/upgrades.
- `modules/banking/administration`
  Depends on `PrismaService`.
  Owns society-admin user/branch management and uses the shared user-extra-field compatibility helper.

## Web

- `shared/api/http.ts`
  Base HTTP client. Depends on `NEXT_PUBLIC_API_URL` and now sends browser credentials for cookie-backed API auth.
- `shared/auth/session.ts`
  Client session persistence. Depends on localStorage, `/api/session`, and API logout for cleanup.
- `shared/auth/session-payload.ts`
  Shared session parsing and dashboard routing logic used by client code, server session helpers, and middleware.
- `middleware.ts`
  Depends on the web session cookie only. Handles guest/protected redirects and role-aware dashboard routing.
- `shared/public/public-data-cache.ts`
  Short-lived browser cache for public societies and pricing. Used by home, register, login, and society portal pages to reduce cold-fetch delays.
- `app/login`, `app/register`, `app/[societyCode]/*login`
  Depend on the public auth directory APIs and the public data cache for faster initial paint after navigation.
