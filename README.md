# Infopath Society Savings

Production-oriented monorepo for the Infopath society banking platform.

- Frontend: Next.js + Material UI in `apps/web`
- Backend: NestJS + Prisma in `apps/api`
- Database: PostgreSQL via Docker Compose

## Product scope

- Public marketing and policy pages with a shared site footer
- Public workspace guide pages for client, agent, society admin, and platform admin roles
- Login, registration, and checkout flows
- Role-aware dashboard for `CLIENT`, `AGENT`, `SOCIETY`, and `PLATFORM` users
- Dashboard personalization with theme presets and language selection
- Dedicated society administration pages for institution setup and branch configuration
- Module workspaces for customers, accounts, deposits, loans, reports, monitoring, and more
- Billing and digital-payment support for society subscriptions

## Current delivery status

- The dashboard shell is theme-aware and language-aware across shared cards and controls.
- Society admins can open institution setup and branch management from the dashboard and save those records from dedicated administration pages.
- Platform admins remain focused on monitoring, reporting, and portfolio-level user visibility rather than society-local setup tabs.
- Public role-guide pages are available from the navbar under `Workspaces`.
- Role visibility is documented through dedicated workspace pages and supporting product documentation.

## Repo structure

```text
apps/
  api/
    prisma/
    src/
      app/
      common/
      modules/
        auth/
        billing/
        payments/
        banking/
          accounts/
          administration/
          branches/
          cashbook/
          cheque-clearing/
          customers/
          demand-drafts/
          deposits/
          health/
          heads/
          ibc-obc/
          investments/
          loans/
          locker/
          monitoring/
          reports/
          transactions/
          users/
  web/
    app/
    components/
    features/
    shared/
docs/
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start PostgreSQL:

```bash
npm run db:up
```

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Optional: seed demo/sample data only if you explicitly want sample records:

```bash
npm run prisma:seed
```

6. Start the apps in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

## Primary routes

- Web app: `http://localhost:3000`
- API base: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api/docs`
- Dashboard: `/dashboard`
- Society admin setup pages: `/dashboard/society`, `/dashboard/branches`
- Workspaces overview: `/workspaces`
- Role pages: `/workspaces/client`, `/workspaces/agent`, `/workspaces/society-admin`, `/workspaces/platform-admin`
- Module workspace: `/modules/<slug>`
- Public pages: `/about`, `/contact`, `/privacy-policy`, `/terms-of-service`, `/advertising-disclosure`

## Verification

Frontend:

```bash
npm --workspace @infopath/web run test
npm --workspace @infopath/web run build
```

Backend:

```bash
npm --workspace @infopath/api run test
```

Targeted checks used during the recent cleanup:

```bash
npm --workspace @infopath/web run test -- society-operations-data.spec.ts
npm --workspace @infopath/api run test -- locker.service.spec.ts
```

## Clean database support

- The society dashboard now supports clean-start testing without browser-side seed records for members, plans, accounts, or lockers.
- Demo credentials exist only when demo data is explicitly seeded.
- Locker allocation is available from the society dashboard under `Locker > Locker Registry`.

## Documentation

- Product and UX overview: `docs/platform-overview.md`
- Role-based access and visibility: `docs/role-access-matrix.md`
- Backend capabilities and integration notes: `docs/backend-capabilities.md`
