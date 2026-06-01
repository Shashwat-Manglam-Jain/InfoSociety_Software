# InfoPath Banking SaaS Platform

Multi-tenant cooperative banking software. Each **Society** is an independent tenant managed by a platform **SuperAdmin**.

## Quick Start

```bash
# Start Postgres
npm run db:up

# Install dependencies
npm install

# Generate Prisma client & run migrations
npm run prisma:generate
npm run prisma:migrate

# Start both apps (separate terminals)
npm run dev:api   # API on :4000
npm run dev:web   # Web on :3000
```

## Monorepo Layout

```
apps/
  api/   → NestJS REST API  (port 4000, prefix /api/v1)
  web/   → Next.js frontend (port 3000)
```

## Build & Run

| Command | What it does |
|---------|-------------|
| `npm run dev:api` | Start API in watch mode (SWC) |
| `npm run dev:web` | Start Next.js dev server |
| `npm run build:api` | Compile API to `apps/api/dist/` |
| `npm run build:web` | Build Next.js to `apps/web/.next/` |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run pending migrations |
| `npm run prisma:seed` | Seed the database |

## Test

```bash
cd apps/api && npm test      # API unit tests (Jest)
cd apps/web && npm test      # Web component tests (Jest + jsdom)
```

## Lint

```bash
cd apps/api && npm run lint  # ESLint on API
cd apps/web && npm run lint  # next lint on web
```

## Environment

Three environments with matching `.env.<env>` files in each app:

- **development** — local DB, swagger enabled, verbose logging
- **staging** — staging DB, swagger enabled, seeded data
- **production** — injected secrets, swagger off, strict security

Copy `.env.example` → `.env.local` to get started.

## Architecture Conventions

- Global guards: JwtAuthGuard → RolesGuard → WorkspaceAccessGuard (applied in order)
- All endpoints require JWT unless decorated with `@Public()`
- Use `@Roles(UserRole.X)` for role-based access
- Use `@CurrentUser()` to inject the authenticated user
- DTOs use `class-validator` decorators; `ValidationPipe` is global with `whitelist: true`
- Prisma is the only ORM; no raw SQL except for optional column detection
- Swagger decorators (`@ApiTags`, `@ApiBearerAuth`) on every controller
