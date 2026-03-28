# Role Access Matrix

## Purpose

This document defines the production access model for Infopath. It should be used during solution design, onboarding, demonstrations, and permission reviews so each account receives the correct workspace and only the controls appropriate to its role.

## Public workspace routes

The public navbar exposes a `Workspaces` menu so prospects, implementation teams, and client stakeholders can review role boundaries before login.

- `/workspaces`
- `/workspaces/client`
- `/workspaces/agent`
- `/workspaces/society-admin`
- `/workspaces/platform-admin`

## Executive summary

| Role | Primary audience | Data scope | Core modules | Not included |
| --- | --- | --- | --- | --- |
| `CLIENT` | Members and retail customers | Own records only | Accounts, deposits, loans, transactions, locker | Institution setup, staff operations, reporting, administration |
| `AGENT` | Front-office and field staff | One assigned society | Customers, accounts, deposits, loans, transactions, clearing, cashbook, reports, locker | Institution profile setup, branch governance, platform controls |
| `SUPER_USER` | Society leadership and institution admins | Full visibility inside one society | All society modules plus institution setup, administration, users, monitoring | Cross-society governance |
| `SUPER_ADMIN` | Central platform operators | Cross-society portfolio visibility | Monitoring, reports, user directory, society lifecycle controls | Society-local transaction handling and branch setup |

## Detailed role guidance

### Client banking workspace

Authorized capabilities:

- Personal balances, account activity, transaction history, deposits, loans, and enabled locker records
- Dashboard personalization through approved language and theme settings
- Self-service visibility limited to the signed-in member

Restricted capabilities:

- Customer master maintenance
- Society-wide reports and cash operations
- User administration and monitoring
- Institution setup, billing, and branch controls

### Agent operations workspace

Authorized capabilities:

- Customer onboarding, KYC review, and account servicing
- Deposits, loans, transactions, clearing, demand drafts, and inward or outward instruments
- Cashbook handling, locker servicing, and operational reports inside one society

Restricted capabilities:

- Institution profile and billing setup
- Branch policy and society-wide governance controls
- Cross-society monitoring and platform administration

### Society administration workspace

Authorized capabilities:

- Institution master configuration, compliance data, billing details, and branch setup
- All society operational modules, including administration, reports, users, and monitoring
- Oversight of staff and member-facing workspaces within the current institution

Restricted capabilities:

- Cross-society governance
- Global platform approvals outside the assigned society

### Platform governance workspace

Authorized capabilities:

- Society onboarding, suspension, and access-control decisions
- Platform-wide monitoring, reporting, and user visibility
- Portfolio governance across all institutions in the deployment

Restricted capabilities:

- Society-local institution master maintenance
- Society-local branch configuration
- Day-to-day member servicing and branch transaction entry

## Provisioning policy

1. Use `CLIENT` for end members who should only see their own records.
2. Use `AGENT` for staff running operational workflows inside one assigned society.
3. Use `SUPER_USER` for institution owners and administrators responsible for one society end-to-end.
4. Use `SUPER_ADMIN` only for central platform governance and multi-society oversight.
5. Start product demos and client walkthroughs from `/workspaces` so the access model is clear before authentication.
