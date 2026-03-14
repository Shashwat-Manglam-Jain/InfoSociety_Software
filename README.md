# Infopath Solutions - Society Savings Platform

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
- North Agent: `agent2 / Agent2@123`
- Client: `client1 / Client@123`
- Premium Client: `premium1 / Premium@123`
- North Client: `client2 / Client2@123`

## 9. AdSense Configuration
- Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`, and `NEXT_PUBLIC_ADSENSE_SLOT` in `apps/web/.env.local`.
- Ads render for `FREE` plan accounts by default.
- Premium plan (`/billing/upgrade`) is monthly and ad-free in dashboard.
- `ads.txt` is available at `/ads.txt` (update publisher ID in `apps/web/public/ads.txt`).
- Use compliant placements only. Do not use incentivized or forced click patterns.

## 10. Production Deployment Checklist

### Backend (`apps/api`)
- [ ] Set `NODE_ENV=production` in environment
- [ ] Use a strong `JWT_SECRET` (min 32 characters, random alphanumeric)
- [ ] Update `DATABASE_URL` to production PostgreSQL instance
- [ ] Set `SHADOW_DATABASE_URL` for safe migrations
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production frontend domain
- [ ] Update `CORS_ALLOWED_ORIGINS` to production frontend domain only
- [ ] Run `npm run prisma:migrate` to apply all migrations
- [ ] Run `npm run prisma:generate` to regenerate Prisma client
- [ ] Verify API health: `GET /api/v1/banking/health`
- [ ] Verify Swagger docs: `GET /api/v1/docs`
- [ ] Run full test suite: `npm --workspace @infopath/api test`
- [ ] Build production bundle: `npm --workspace @infopath/api run build`

### Frontend (`apps/web`)
- [ ] Update `NEXT_PUBLIC_API_URL` to production API domain
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Set `NEXT_PUBLIC_API_TIMEOUT_MS` to appropriate timeout (12000ms recommended)
- [ ] Configure `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` if using AdSense
- [ ] Update `ads.txt` with proper Google AdSense publisher ID
- [ ] Run full test suite: `npm --workspace @infopath/web test`
- [ ] Build production bundle: `npm --workspace @infopath/web run build`
- [ ] Verify static export works: pages should render at build time
- [ ] Test all critical flows: register, login, dashboard, operational modules

### Security & Operations
- [ ] Enable HTTPS/TLS on both frontend and backend
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up monitoring/alerting for API errors
- [ ] Configure database backups (daily minimum)
- [ ] Enable query logging for debugging
- [ ] Set appropriate database connection pool size
- [ ] Configure CORS headers (no wildcards in production)
- [ ] Enable security headers (Referrer-Policy, X-Content-Type-Options, X-Frame-Options)
- [ ] Set up audit logging for sensitive operations
- [ ] Configure payment provider credentials securely (if using real payments)
- [ ] Test disaster recovery procedures

### Database
- [ ] Create database backup before first migration
- [ ] Run `npm run prisma:migrate` to apply pending migrations
- [ ] Run `npm run prisma:seed` only on initial setup (remove in production if needed)
- [ ] Verify all tables and indexes are created
- [ ] Set up automated backups

### Deployment Steps
1. **Prepare environment**:
   ```bash
   cp apps/api/.env.example apps/api/.env  # Update with production values
   cp apps/web/.env.example apps/web/.env.local  # Update with production values
   ```

2. **Install and build**:
   ```bash
   npm install --omit=dev
   npm --workspace @infopath/api run build
   npm --workspace @infopath/web run build
   ```

3. **Database setup**:
   ```bash
   npm --workspace @infopath/api run prisma:generate
   npm --workspace @infopath/api run prisma:migrate
   ```

4. **Start services**:
   - API: `npm --workspace @infopath/api run start:prod`
   - Web: `npm --workspace @infopath/web run start`

5. **Health checks**:
   ```bash
   curl https://api.yourdomain.com/api/v1/banking/health
   curl https://yourdomain.com/  # Should return 200
   ```

### Monitoring Endpoints
- API Health: `GET /api/v1/banking/health`
- Swagger Docs: `GET /api/v1/docs`
- Frontend: All routes prerendered at build time for fast serving


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
- Investments
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
