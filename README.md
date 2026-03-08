# Infopath Solutions - Info Banking Platform

Monorepo setup with:
- Frontend: Next.js (`apps/web`)
- Backend: NestJS (`apps/api`)
- ORM: Prisma
- Database: PostgreSQL (Docker)

## 1. Prerequisites
- Node.js 20+
- npm 10+
- Docker + Docker Compose

## 2. Environment Setup
1. Copy root env file:
   - `cp .env.example .env`
2. Copy backend env file:
   - `cp apps/api/.env.example apps/api/.env`
3. Copy frontend env file:
   - `cp apps/web/.env.example apps/web/.env.local`

## 3. Install Dependencies
```bash
npm install
```

## 4. Start PostgreSQL
```bash
npm run db:up
```

## 5. Prisma Setup
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 6. Run Applications
Terminal 1:
```bash
npm run dev:api
```

Terminal 2:
```bash
npm run dev:web
```

## 6.1 Run Tests
Backend tests:
```bash
npm --workspace @infopath/api run test
```

Frontend tests:
```bash
npm --workspace @infopath/web run test
```

## 7. URLs
- Frontend: http://localhost:3000
- API base: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs
- PostgreSQL: localhost:5433
- Stop DB container: `npm run db:down`
- Module operation workspace: `http://localhost:3000/modules/<module-slug>`
- SEO routes: `/sitemap.xml`, `/robots.txt`
- AdSense policy routes: `/privacy-policy`, `/terms-of-service`, `/contact`, `/advertising-disclosure`
- Registration page: `/register`

## 8. Demo Login Credentials
- Superuser: `superuser / Super@123`
- Agent: `agent1 / Agent@123`
- Client: `client1 / Client@123`
- Premium Client: `premium1 / Premium@123`

## 9. AdSense Configuration
- Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`, and `NEXT_PUBLIC_ADSENSE_SLOT` in `apps/web/.env.local`.
- Ads render for `FREE` plan accounts by default.
- Premium plan (`/billing/upgrade`) is monthly and ad-free in dashboard.
- `ads.txt` is available at `/ads.txt` (update publisher ID in `apps/web/public/ads.txt`).
- Use compliant placements only. Do not use incentivized or forced click patterns.

## Subscription and Billing APIs
- `GET /api/v1/billing/plans`: public list of Common (free) and Premium (monthly) plans
- `GET /api/v1/billing/me`: current user subscription state
- `POST /api/v1/billing/upgrade`: upgrade authenticated user to Premium
- `POST /api/v1/billing/cancel`: schedule Premium cancellation at period end

## Module Coverage (Implemented Core APIs)
- Customer & KYC
- Account Opening & Maintenance
- Deposit Management
- Loan Management
- Daily Transactions & Passing
- Cheque Clearing
- Demand Draft
- IBC/OBC
- Other Bank Investments
- Locker
- Cashbook & Trial Balance
- Administration (working day/month end/year end)
- Reports and Enquiries
- Users
- Monitoring

Detailed functional checklist is in:
- `docs/module-roadmap.md`
- `apps/api/src/modules/banking/reports/report-catalog.ts`

## Folder Structure (Industry Standard)
```text
apps/
  api/
    src/
      app/
        app.controller.ts
        app.module.ts
      common/
        auth/
        database/
        dto/
      modules/
        auth/
        billing/
        banking/
          accounts/
          administration/
          cashbook/
          cheque-clearing/
          customers/
          demand-drafts/
          deposits/
          health/
          ibc-obc/
          investments/
          loans/
          locker/
          monitoring/
          reports/
          transactions/
          users/
        shared/
  web/
    app/
      register/
      dashboard/
      login/
      modules/[slug]/
    components/
      ads/
      ui/
    features/
      banking/
    shared/
      api/
      auth/
      theme/
      types/
```

## Notes
- This codebase now includes functional APIs for customer/account/deposit/loan/transaction/instrument/locker/cashbook/administration/report-job workflows.
- Legacy parity is still partial for advanced accounting engines, printing/export tooling, and some specialized modules (for example full pigmy and nominee/joint/guarantor flows).
- Prisma schema includes base entities for accounts, deposits, loans, ledgering, instruments, locker, reporting, and operations controls.
- Frontend now includes an operational workspace for every module card, with form-driven execution for module endpoints.
