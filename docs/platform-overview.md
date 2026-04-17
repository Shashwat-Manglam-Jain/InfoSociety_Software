# Platform Overview & Architecture (Infopath Society Savings)

**Infopath Society Savings** is a cutting-edge Core Banking System (CBS) engineered exclusively for Cooperative Credit Societies, Thrift Unions, and Urban Banks. By transforming physical, paper-based ledger systems into an interconnected, multi-tenant cloud application, the platform effectively closes the operational gap between Field Agents, Branch Managers, Society Head Offices, and their end-clients.

## 🎯 Primary Ecosystem Goals

Traditional society management involves disconnected data silos. A Pigmy Agent out in the field collects cash, brings it to a teller, and the teller writes it in a physical day book. **Our platform digitizes this entirely.**

1. **Absolute Multi-Tenancy**: Multiple societies can onboard onto the single Infopath platform, maintaining 100% data and privacy isolation through unique `societyCode` architecture rules enforced at the database level.
2. **Unified Role Interfaces**: Providing specialized sub-portals for different operational tiers instead of one confusing massive application.
3. **Digitize the "Unbanked" Products**: Bring physical banking operations (like Daily Pigmy deposits, physical Locker allocations, Inland/Outward Bill clearings) onto a streamlined UI.
4. **Cloud-First SaaS Billing**: A built-in subscription model allows Infopath (the platform owner) to automatically bill institutions for platform usage.

## 📱 User Experience (UX) Architecture

Our frontend is engineered with **Next.js 15 (App Router)** and **Material UI**. We follow strict UX paradigms:

### 1. Isolated Sub-Portals
Instead of forcing all users to log into one root route and seeing a wall of restricted menus, we use contextual routing:
- **`/[societyCode]/clientlogin`**: Clean, non-intimidating B2C interface for standard members to check their passbooks.
- **`/[societyCode]/agentlogin`**: Rapid, high-contrast B2B interface optimized for iPad/Mobile to allow agents to punch in collections swiftly.
- **`/login`**: The primary institutional gateway strictly for Society Admins. 

### 2. High-Fidelity & Theming
- **Vibrant Dark/Light Toggle**: Societies can toggle between high-fidelity dark themes and bright high-contrast light themes.
- **Micro-Animations**: Uses contextual `framer-motion` and Material UI transitions so that when a teller approves a loan or creates a deposit, the system feels alive and responsive.
- **Responsive Layout**: Agents use the application almost exclusively on tablets/mobiles, while Head Office Society Admins use it on massive desktop monitors. Our Material UI Grid layout perfectly scales between these viewports.

---

## 🏛️ Domain Modules (The Banking Core)

The application is heavily modularized into specialized banking concepts. Here's a quick overview of what the platform manages:

1. **Customers & Accounts Module**: The foundation. A Customer holds many Accounts (Savings, Checking, FD, RD, Loan).
2. **Loans Module**: Tracks origination, KYC approval, principal amount, interest rate configuration, and EMI tracking schedules.
3. **Deposits Module**: Supports Fixed Deposits (FDs) where principal is locked, and Recurring Deposits (RDs/Pigmy) where daily/monthly collections are enforced.
4. **Physical Vaults & Lockers**: Maps physical safety deposit boxes to branch codes, assigns them to customers, and automatically triggers annual renewal invoices.
5. **Cheque Clearing (IBC/OBC)**: Maps physical cheque instruments mapping clearing zones (Inward vs Outward) and tracking standard settlement days.
6. **Cashbook / Day Book Maker-Checker**: Ensures that money digitally collected by agents exactly matches the physical cash dropped into the branch teller pool at the end of the day.
