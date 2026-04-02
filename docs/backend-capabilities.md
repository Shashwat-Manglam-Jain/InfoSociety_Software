# Backend Capabilities

## Core services

The NestJS API currently exposes these major service groups:

- `auth`
  - Login
  - Current-user profile
  - Public society list
  - Client, agent, and society registration
- `billing`
  - Plan listing
  - Upgrade and cancellation flows
- `payments`
  - Payment request and collection flows

## Banking modules

The banking API surface currently includes:

- `accounts`
- `administration`
- `branches`
- `cashbook`
- `cheque-clearing`
- `customers`
- `demand-drafts`
- `deposits`
- `health`
- `heads`
- `ibc-obc`
- `investments`
- `loans`
- `locker`
- `monitoring`
- `reports`
- `transactions`
- `users`

## Notable admin endpoints

### Branches

`apps/api/src/modules/banking/branches/branches.controller.ts`

- `GET /banking/branches`
- `POST /banking/branches`
- `PATCH /banking/branches/:id`

### Heads

`apps/api/src/modules/banking/heads/heads.controller.ts`

- `GET /banking/heads`
- `POST /banking/heads`
- `PATCH /banking/heads/:id`

### Monitoring

`apps/api/src/modules/banking/monitoring/monitoring.controller.ts`

- `POST /monitoring/societies`
- `PATCH /monitoring/societies/:id/access`
- `GET /monitoring/societies`
- `GET /monitoring/overview`

The monitoring update endpoint now carries both:

- access controls and billing settings
- society master profile fields such as PAN, TAN, GST, capital, and registration details

## Current integration truth

The backend already contains real services for:

- Branch CRUD
- Head master CRUD
- Society monitoring and access updates
- Role-aware banking modules and reporting
- Auth profile responses that now include extended society master fields for dashboard editing

The current frontend wiring uses these live backend capabilities:

- society admin institution-profile saves through monitoring update APIs
- branch creation and updates through branch APIs
- role-based workspace visibility from the access map in `apps/web/features/banking/account-access.ts`

## Data layer

- ORM: Prisma
- Database: PostgreSQL
- Migrations live in `apps/api/prisma/migrations`
- Schema lives in `apps/api/prisma/schema.prisma`

## Developer entry points

- API module registration: `apps/api/src/app/app.module.ts`
- Auth service: `apps/api/src/modules/auth/auth.service.ts`
- Prisma schema: `apps/api/prisma/schema.prisma`
