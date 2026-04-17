# Infopath Society Savings (Core Banking Platform)

Welcome to the **Infopath Society Savings** platform! This is a modern, production-ready monorepo that provides a complete Core Banking System (CBS) built exclusively for Cooperative Credit Societies, Urban Banks, and Thrift Unions.

If you are a new developer or tester, this guide will walk you through the problem we are solving, how the application is built, and how you can get started instantly with our pre-populated mock data.

## 🌍 The Real-World Problem We Solve

In India and other emerging markets, **Cooperative Societies and Credit Unions** manage thousands of crores of rupees (₹) in collective savings and micro-loans. However, they traditionally rely on:
1. **Paper-based ledgers** or outdated local desktop software.
2. **Fragmented operations**, making it hard to sync data between branch offices, field agents (who collect daily deposits), and the head office.
3. **No digital access for members**, meaning clients cannot check their balances or pay EMIs via modern digital methods (UPI, Net Banking) without visiting a branch.

**Infopath Society Savings** brings these institutions into the digital age. It provides a secure, multi-tenant cloud platform where:
- **Societies** can manage all financial products (Savings, Checking, Fixed Deposits, Recurring Deposits, Loans, Lockers, and Cheque Clearing).
- **Field Agents** can log digital collections (daily deposit schemes / Pigmy) via their mobile dashboards.
- **Clients/Members** can log into their tailored portals to view passbooks, request locker visits, and pay loan EMIs.
- **Platform Admins** can oversee the entire ecosystem and provide SaaS billing to the societies using the software.

To enforce security and institutional compliance, the system incorporates strict tenant isolation (Society Codes), Role-Based Access Control (RBAC), and Aadhaar-based secondary identity verification.

---

## 🏗️ Technology Stack

This repository is built as a highly scalable monorepo using industry-standard tools:
- **Frontend (`apps/web`)**: Next.js 15 (App Router), React, Material UI (MUI), and TypeScript.
- **Backend (`apps/api`)**: NestJS 11, TypeScript, and JWT-based Authentication.
- **Database**: PostgreSQL (managed via Docker) interfaced with Prisma ORM (`v6.2.1`).

```text
apps/
  api/      # NestJS Backend API
    src/modules/   # Domain logic (Accounts, Loans, Locker, Deposits, etc.)
  web/      # Next.js Frontend
    app/           # Next.js Pages & Layouts (Admin, Society, Client, Agent portals)
docs/       # Detailed Architecture and System Documentation
```

---

## 🚀 Getting Started (Noob-Friendly Guide)

To play around with the app, we have a **Seed Script** that populates the database with realistic mock data (societies, accounts, balances, users, and branches).

### 1. Prerequisites
- **Node.js**: v20 or higher.
- **Docker**: For running the local PostgreSQL database.

### 2. Setup environment
First, install all necessary dependencies:
```bash
npm install
```

Copy the environment files for both apps:
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3. Start Database & Migrate
Start the PostgreSQL database container in the background:
```bash
npm run db:up
```

Apply the database schema schemas (this sets up tables and relations):
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed the Database (CRITICAL for Testing)
Run the seed command to inject pre-configured data. **This gives you login credentials so you can actually test the app!**
```bash
npm run prisma:seed
```
*(The seed command sets up 3 different societies, various deposit/loan accounts, and test users).*

### 5. Start the Application
Run the backend API and frontend Next.js dev servers in separate terminals:
```bash
# Terminal 1 - Backend (Runs on http://localhost:4000)
npm run dev:api

# Terminal 2 - Frontend (Runs on http://localhost:3000)
npm run dev:web
```

---

## 🔑 Pre-Configured Demo Accounts

After running the seed script, you can log in at **[http://localhost:3000/login](http://localhost:3000/login)**.

When logging in to the `Head Office Society` (`SOC-HO`), use these main credentials:

| Role | Username | Password | Purpose |
|------|-----------|----------|---------|
| **Society Admin** | `superuser` | `Super@123` | Full access to Society configurations, Vaults, Loan approvals, and Reports. |
| **Agent** | `agent1` | `Agent@123` | Field agent portal for logging out-of-office collections (Pigmy). |
| **Client (Demo)** | `client1` | `Client@123` | General member checking their passbook and locker. |

---

## ✨ Core Platform Features

This software incorporates an extensive, production-ready feature set tailored to modern financial cooperative limits:
- **Comprehensive Account Types:** Supports standard Savings Accounts, Current Checking Accounts, Fixed Deposits (FDs), and run-based Recurring Deposits (RDs).
- **Loan Disbursals & Collections:** Workflow from processing loan documents to tracking active EMIs mapping strictly to user account ledgers.
- **Cheque & Instrument Clearings:** Deep support for Inland Bills for Collection (IBC), Outward Bills (OBC), and Demand Draft generation.
- **Physical Locker Registries:** Digital locker registries mapped directly to branch locations permitting recurring service fee billing.
- **Advanced Cashbook Integrations:** Day Book reporting syncing debit/credit entries globally across teller workflows matching modern accounting pipelines. 
- **Subscriptions & Billing Engine:** Built-in billing to ensure only fully subscribed or valid trial Societies are allowed access, keeping the SaaS ecosystem healthy.

---

## 📚 Detailed Documentation (`docs/` folder)

To deeply understand how the system is engineered and how to contribute, we have created an organized `docs/` folder. This is exceptionally helpful for new developers onboarding onto the project:

1. **[Platform Overview & UX (`docs/platform-overview.md`)](docs/platform-overview.md)**
   Starts here! This module explains the grand layout of the user interfaces, the design systems, and exactly how different workspaces interact. Best for frontend engineers mapping out UI structure.

2. **[Role Access Matrix (`docs/role-access-matrix.md`)](docs/role-access-matrix.md)**
   The core of our RBAC (Role-Based Access Control) architecture. This details EXACTLY what permissions a Client, Agent, Society Admin, and Platform Admin have across every single banking module (Investments, Loans, Accounts, Lockers). Essential reading for security implementations.

3. **[Backend Capabilities & Integrations (`docs/backend-capabilities.md`)](docs/backend-capabilities.md)**
   Covers the NestJS/Prisma structure, API conventions, and integration strategies for adding new features (like Cheque Clearing or Demand Drafts). Geared closely toward backend engineers building new logic.

4. **[UI Authentication Guide (`docs/ui-authentication-guide.md`)](docs/ui-authentication-guide.md)**
   Extremely important for Frontend and Mobile developers. Contains full JSON payload signatures, Aadhaar logic checks, and secure session management conventions needed when engineering login forms.

## 🛡️ Security Highlights
- **Aadhaar Verification:** Administrative logins require Aadhaar verification cross-checks, shielding sensitive banking functions.
- **Tenant Isolation:** The backend API (`auth.service.ts`) strictly cross-checks JWT access boundaries to prevent a user in `Society A` from accessing `Society B`'s financial ledgers.
