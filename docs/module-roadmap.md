# Info Banking Module Roadmap and Implementation Audit

Last updated: 2026-03-09

## 1) System Architecture (What and Why)

### Monorepo structure
- `apps/web` (Next.js + Material UI): role-based web UI for client, agent, superuser.
- `apps/api` (NestJS): domain APIs, auth, workflow orchestration.
- `apps/api/prisma` (Prisma + PostgreSQL): banking data models and migrations.

Why created:
- Keep frontend and backend versioned together.
- Reuse shared business vocabulary across teams.
- Support independent deployment scaling later.

### Core technical decisions
- JWT auth + RBAC (`CLIENT`, `AGENT`, `SUPER_USER`) for controlled access.
- Society-scoped data access for agent users.
- PostgreSQL with normalized entities (customer/account/loan/transaction/etc.).
- Swagger docs at `/api/docs` for operations and QA handoff.

Why created:
- Banking workflows require strict role and scope boundaries.
- Auditable and consistent data model is required for ledger-like behavior.

---

## 2) Module-by-Module: What It Does and Why It Exists

### Authentication (`auth`)
What it does:
- Login and token issuance.
- Client registration, agent registration (superuser-only).
- Current user profile endpoint.

Why created:
- Entry point for all role-specific access.
- Prevent unauthorized actions on financial records.

### Monitoring (`monitoring`)
What it does:
- Society creation.
- Society list with counts.
- Global/assigned monitoring overview (users/customers/accounts/transactions/total balances).

Why created:
- Superuser must monitor all societies.
- Agent needs scoped society visibility.

### Customers (`customers`)
What it does:
- Customer create/list/get/update.
- Customer code generation per society.
- Client self-profile endpoint.

Why created:
- Customer master is the source entity for account/loan/locker lifecycle.

### Accounts (`accounts`)
What it does:
- Account create/list/get/update/status update.
- Role-based data scope.
- Account number generation by account type.

Why created:
- Central entity for deposits, loans, transactions, cheque clearing, and DD linkage.

### Deposits (`deposits`)
What it does:
- Deposit scheme master create/list.
- Open FD/RD deposit records against accounts.
- Renewal flow with maturity recomputation.
- Lien mark/unmark.

Why created:
- Implement FD/RD operational lifecycle and maturity control.

### Loans (`loans`)
What it does:
- Loan apply/list.
- Sanction, disbursement, recovery, overdue update.
- Loan account linkage and balance updates.

Why created:
- Supports end-to-end loan pipeline from application to settlement tracking.

### Transactions (`transactions`)
What it does:
- Transaction create/list/update.
- Pass transaction (ledger posting behavior).
- Cancel transaction with reversal handling for passed transactions.

Why created:
- Implements daily transaction workflow with controlled posting.
- Preserves correction path for operational mistakes.

### Demand Draft (`demand-drafts`)
What it does:
- DD create/list/update/status.
- DD number generation and clear/cancel/return status changes.

Why created:
- Required for instrument issuance/reconciliation workflow.

### Cheque Clearing (`cheque-clearing`)
What it does:
- Cheque entry create/list/update/status.
- Society-scoped filtering through linked accounts.

Why created:
- Required for clearing-house lifecycle and cheque state tracking.

### IBC/OBC (`ibc-obc`)
What it does:
- Instrument create/list/status update.
- Inward/outward instrument status lifecycle.

Why created:
- Supports bill collection processes and return/clear tracking.

### Investments (`investments`)
What it does:
- Investment create/list.
- Renew and withdraw flows.
- Maturity amount estimation.

Why created:
- Tracks bank investments as treasury/asset operations.

### Locker (`locker`)
What it does:
- Locker create/list.
- Visit logs.
- Locker close operation.

Why created:
- Supports physical asset service workflow and audit trail.

### Cashbook (`cashbook`)
What it does:
- Cashbook create/list/update/delete.
- Single pass and day-wise pass posting.
- Post-pass mode/remark modification path.

Why created:
- Daily cashbook operations and posting controls for accounting workflow.

### Administration (`administration`)
What it does:
- Working day begin/end.
- Month-end/year-end flags.
- User status management.
- Recompute account balance from passed transactions.
- Recompute GL-style day summary from posted cashbook entries.

Why created:
- Operational governance and period closure control.

### Reports (`reports`)
What it does:
- Full report catalog exposure.
- Report run request + job tracking endpoints.
- Scoped job list and job lookup.

Why created:
- Converts large report inventory into executable report jobs and history.

### Users (`users`)
What it does:
- Scoped user directory for superuser/agent.

Why created:
- Basic user manager visibility and operations support.

---

## 3) Frontend Coverage (Material UI + Responsive)

Implemented:
- Role-tabbed login (Client/Agent/Superuser).
- Dashboard with:
  - monitoring cards and society table
  - user directory table
  - module navigation cards
- Responsive layout using Material UI grid/components.
- AdSense banner component and env-based ad configuration.

Why created:
- Immediate role-based operational UI.
- Monetization integration for non-superuser dashboard traffic.

---

## 4) Feature Coverage Matrix

Legend:
- `Implemented`: Working API/UI behavior exists.
- `Partial`: Base workflow exists; advanced legacy variants pending.
- `Planned`: Not yet implemented in current code.

### A) Master and onboarding
- New customer/account masters: `Implemented`
- Issue account number: `Implemented` (auto generation)
- Modification and status change: `Implemented`
- Nominee/joint/operating power/guarantor full modeling: `Planned`

### B) Deposit workflows
- Scheme master: `Implemented`
- FD/RD opening: `Implemented`
- Renewal single/multiple (single API): `Implemented` (single), `Partial` (bulk)
- Interest provision/posting variants: `Partial`

### C) Loan workflows
- Loan application/sanction/disbursement: `Implemented`
- Recovery + overdue update: `Implemented`
- Detailed installment engines and overdue transfer variants: `Partial`

### D) Transactions and passing
- General transaction entry: `Implemented`
- Single pass transaction: `Implemented`
- Cancel (with reversal for posted): `Implemented`
- Modify before/after pass rules: `Implemented` (mode/remark only after pass)
- Pigmy agent-collection special flow: `Partial`

### E) Instruments
- Demand draft lifecycle: `Implemented`
- Cheque clearing lifecycle: `Implemented`
- IBC/OBC lifecycle: `Implemented`
- Stop-payment and advanced exception states: `Partial`

### F) Cashbook and accounting controls
- Cashbook entry/pass/delete/update: `Implemented`
- Day-end auto posting behavior: `Implemented`
- Full trial balance / P&L / balance sheet computation engine: `Partial`

### G) Administration and operations
- Working day begin/day end: `Implemented`
- Month/year end flags: `Implemented`
- User status controls: `Implemented`
- Re-update account balance: `Implemented`
- Full GL re-update historical engine: `Partial`

### H) Reports
- Large report catalog present: `Implemented`
- Report run + job status: `Implemented`
- Full rendered report output formats/PDF/export/mail: `Partial`

### I) Tools and utilities
- Search by account/customer in APIs: `Implemented` (query filters)
- Backup tooling and restore jobs: `Planned`
- Signature scan/display, passbook print pipelines: `Planned`

---

## 5) What Is Still Pending for Full Legacy Parity

1. Pigmy specialized batch flows (agent collection balancing, commission automation).
2. Nominee/joint/guarantor/operating-power relational models and APIs.
3. Full interest engine variants (quarterly/half-yearly/yearly posting matrices).
4. Full statutory financial statement generator (trial balance, P&L, balance sheet as accounting outputs).
5. Printable artifacts (passbook, notices, cheque/DD print templates) and mail/export subsystem.
6. Backup/restore automation module.
7. Rich UI workflows per module (currently dashboard + module cards; not full operation screens).

---

## 6) Delivery Recommendation (Next Iterations)

1. Data model expansion for nominee/joint/guarantor + pigmy + standing instructions.
2. Accounting engine hardening for GL, period close, and statement generation.
3. Report rendering/export pipeline (PDF/Excel/email) and printable document services.
4. Module-specific frontend pages for each workflow (forms, lists, approval actions, reports).
5. Audit logging and immutable event trail for high-risk operations.

---

## 7) Automated Test Coverage Added

- Backend (`apps/api`): Jest unit tests for `accounts`, `transactions`, `administration`, and `reports` services.
- Frontend (`apps/web`): Jest + Testing Library tests for login behavior, operation catalog coverage, and request builder utility.
- All added suites are runnable with:
  - `npm --workspace @infopath/api run test`
  - `npm --workspace @infopath/web run test`
