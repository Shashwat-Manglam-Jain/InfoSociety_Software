# Architecture Overview

## System Overview

InfoPath is a **multi-tenant SaaS** platform for cooperative banking societies.
A single deployment serves many societies, each with isolated data and its own staff.

```
┌─────────────────────────────────────────────────────────────┐
│                    Platform SuperAdmin                       │
│          (manages societies, approvals, billing)             │
└────────────────────────┬────────────────────────────────────┘
                         │ oversees
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │Society A │     │Society B │     │Society C │
   │(tenant)  │     │(tenant)  │     │(tenant)  │
   └────┬─────┘     └────┬─────┘     └─────────┘
        │                │
   ┌────┼────┐      ┌────┼────┐
   ▼    ▼    ▼      ▼    ▼    ▼
  HO  Br-1  Br-2  HO  Br-1  Br-2     ← Branches
   │    │    │      │    │    │
   ▼    ▼    ▼      ▼    ▼    ▼
 Users (SUPER_USER, AGENT, CLIENT)     ← Role-based access
```

## User Roles

| Role | Scope | Description |
|------|-------|-------------|
| `SUPER_ADMIN` | Platform | Manages all societies, approvals, platform billing |
| `SUPER_USER` | Society | Society administrator — manages branches, staff, all banking ops |
| `AGENT` | Society | Field agent — collects deposits, manages pigmy accounts |
| `CLIENT` | Society | Bank member — views own accounts, transactions, deposits |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | NestJS 11, TypeScript, Express |
| Database | PostgreSQL 16, Prisma ORM |
| Frontend | Next.js 15, React 18, MUI 7, Recharts |
| Auth | JWT (cookie + bearer), bcryptjs |
| Payments | Razorpay (collections) + RazorpayX (payouts) |
| Build | SWC (API), Turbopack (Web) |
| Deploy | Docker multi-stage (Alpine) |

## API Module Map

```
apps/api/src/
├── app/                          # Root module + health endpoint
├── common/
│   ├── auth/                     # Guards, decorators, JWT logic
│   ├── cache/                    # In-memory TTL cache
│   ├── database/                 # Prisma service, seed helpers
│   ├── dto/                      # Shared pagination DTO
│   └── http/                     # Rate limiter, request logging
└── modules/
    ├── auth/                     # Login, register, password, /me
    ├── billing/                  # Subscription management
    ├── payments/                 # Razorpay integration
    └── banking/
        ├── accounts/             # Account CRUD, status management
        ├── administration/       # Branches, users, working days, GL
        ├── branches/             # Branch listing (public-facing)
        ├── cashbook/             # Cash book entries, posting
        ├── cheque-clearing/      # Cheque clearing house
        ├── customers/            # Customer CRUD, KYC
        ├── demand-drafts/        # DD issue, clear, return
        ├── deposits/             # FD/RD schemes, accounts
        ├── heads/                # GL head master
        ├── health/               # Health check endpoint
        ├── ibc-obc/              # Inter-branch clearing
        ├── investments/          # Other-bank investments
        ├── locker/               # Safe deposit lockers
        ├── loans/                # Loan lifecycle
        ├── monitoring/           # Platform monitoring (superadmin)
        ├── reports/              # Report generation
        ├── shared/               # Module access config
        ├── transactions/         # Core transaction engine
        └── users/                # User listing for society
```

## Frontend Structure

```
apps/web/
├── app/
│   ├── (pages)                   # Public pages (home, about, contact)
│   ├── login/                    # Platform login
│   ├── register/                 # Society registration
│   ├── [societyCode]/            # Society-scoped login portals
│   │   ├── stafflogin/
│   │   ├── agentlogin/
│   │   └── clientlogin/
│   ├── dashboard/
│   │   ├── superadmin/           # Platform admin dashboard
│   │   ├── society/              # Society admin dashboard
│   │   ├── agent/                # Agent dashboard
│   │   └── client/               # Client dashboard
│   ├── auth/                     # Password change
│   └── api/                      # Next.js API routes (razorpay, session)
├── components/                   # Shared UI components
├── features/                     # Feature-specific components
│   ├── banking/                  # Banking operation components
│   ├── branches/                 # Branch management
│   ├── roles/                    # Role-based UI config
│   ├── shared/                   # Cross-feature components
│   └── society/                  # Society management
└── shared/
    ├── api/                      # API client (fetch wrapper)
    ├── auth/                     # Session management
    ├── config/                   # Branding, constants
    ├── i18n/                     # Translations (en/hi)
    ├── lib/                      # Shared utilities
    ├── public/                   # Public data cache
    ├── theme/                    # MUI theme config
    ├── types/                    # TypeScript type definitions
    └── ui/                       # Toast, snackbar helpers
```

## Security Model

```
Request → JwtAuthGuard → RolesGuard → WorkspaceAccessGuard → Controller
              │               │                │
              │               │                ├─ Check user.isActive
              │               │                ├─ Check society.isActive
              │               │                └─ Check module access
              │               └─ Check @Roles() decorator
              └─ Verify JWT (cookie or Bearer header)
```

- **Tenant isolation**: Every query filters by `societyId`
- **Module access**: Configurable per-user via `allowedModuleSlugs`
- **Rate limiting**: Per-IP, stricter on auth endpoints
- **CORS**: Explicit origin allowlist
- **Headers**: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

## Data Model (Key Entities)

```
Society ──┬── Branch ──── User (staff/agents)
          │
          ├── Customer ──┬── Account ──┬── Transaction ── LedgerEntry
          │  (Member)    │             ├── DepositAccount
          │              │             ├── LoanAccount ── LoanNotice
          │              │             ├── StandingInstruction
          │              │             └── PassbookPrint
          │              ├── ShareRegister (share capital)
          │              ├── KycDocument
          │              ├── Locker ── LockerVisit
          │              ├── DividendPayout
          │              └── AgentClient (pigmy mapping)
          │
          ├── FinancialYear ── DividendDeclaration ── DividendPayout
          ├── InterestSlab (rate configuration)
          ├── PaymentRequest ── PaymentTransaction
          ├── WorkingDay
          └── SocietySubscription
```

### New Models (Real-World Society Features)

| Model | Purpose |
|-------|---------|
| `ShareRegister` | Member share capital — purchase, surrender, forfeiture |
| `DividendDeclaration` | Annual dividend on shares — rate, total, per-member payout |
| `DividendPayout` | Individual member dividend credit |
| `FinancialYear` | Society accounting year — open/close cycle |
| `InterestSlab` | Configurable interest rates by amount range and tenure |
| `StandingInstruction` | Recurring auto-debit (RD installments, loan EMI) |
| `LoanNotice` | Demand/reminder/legal/NPA/recovery notices |
| `PassbookPrint` | Track last printed transaction per account |

### New Enums

| Enum | Values |
|------|--------|
| `MembershipStatus` | ACTIVE, RESIGNED, EXPELLED, DECEASED, MINOR_TO_ADULT |
| `ShareStatus` | ACTIVE, SURRENDERED, FORFEITED |
| `DividendStatus` | DECLARED, APPROVED, PAID, CANCELLED |
| `NpaClassification` | STANDARD, SUB_STANDARD, DOUBTFUL, LOSS |
| `LoanNoticeType` | DEMAND_NOTICE, REMINDER, LEGAL_NOTICE, NPA_NOTICE, RECOVERY_NOTICE |

## Environments

| Env | Database | Swagger | Auth | Logging |
|-----|----------|---------|------|---------|
| development | Local Postgres | Enabled | Relaxed (dev-secret OK) | Verbose |
| staging | Staging DB | Enabled | Strict secrets | Standard |
| production | Prod DB | Disabled | Strict secrets required | Errors only |
