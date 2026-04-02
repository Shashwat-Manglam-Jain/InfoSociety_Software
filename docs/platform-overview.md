# Platform Overview

## Product architecture

The product is organized into four professional user-facing layers:

1. Public website
   - Home
   - About
   - Contact
   - Workspace overview and role profiles
   - Policy and disclosure pages
2. Authentication and onboarding
   - Login
   - Role-based registration
   - Subscription checkout
3. Role-based workspace shell
   - Shared dashboard experience for all authenticated roles
   - Theme and language personalization
   - Controlled access to operational modules
   - Society administration shortcuts for institution and branch setup
4. Operational banking modules
   - Dedicated execution screens for module-specific workflows

## Role experience

The dashboard acts as the primary control surface after login.

- `CLIENT`
  - Sees only the operational modules assigned to member self-service
  - Works within personal records and account-level visibility
- `AGENT`
  - Sees society-scoped operational modules for servicing and transaction execution
  - Uses the same personalized dashboard shell as other roles
- `SOCIETY`
  - Sees administration shortcuts for institution profile and branch management
  - Retains society-wide access to operations, reports, users, and monitoring
- `PLATFORM`
  - Does not receive society-local setup tabs by default
  - Focuses on monitoring, reporting, and governance across societies

## Public workspace navigation

The public navbar includes a `Workspaces` menu for professional pre-sales and onboarding conversations:

- `/workspaces`
  - Executive overview of the full access model
- `/workspaces/client`
  - Client banking profile
- `/workspaces/agent`
  - Agent operations profile
- `/workspaces/society-admin`
  - Society administration profile
- `/workspaces/platform-admin`
  - Platform governance profile

These routes provide a stable, client-friendly explanation of role boundaries before authentication.

## Personalization standards

The shared settings menu controls:

- Theme presets: `Charcoal`, `Emerald`, `Rose`
- Theme mode: `Light`, `Dark`
- Language: `English`, `Hindi`, `Marathi`

The current dashboard shell applies those settings consistently across:

- Header labels
- Logout button styling
- Dashboard headings and summary cards
- Module card presentation

## Public presentation quality

Public pages now use a shared layout that keeps the footer anchored cleanly on shorter pages such as `/about` and `/contact`, which makes the product feel more like production software and less like a prototype.

## Society administration surfaces

The product currently exposes two society administration forms through dedicated administration pages linked from the dashboard:

- `SocietyForm`
  - Persists compliance, capital, registration, and billing information through the monitoring update APIs
- `BranchForm`
  - Creates and updates branch records, routing details, and service flags through the live branch endpoints

## Route catalog

- `/`
  - Public landing page
- `/login`
  - Authentication
- `/register`
  - Client, agent, and society onboarding
- `/checkout`
  - Subscription completion
- `/dashboard`
  - Main authenticated workspace
- `/dashboard/society`
  - Dedicated society configuration page
- `/dashboard/branches`
  - Dedicated branch management page
- `/workspaces`
  - Access-model overview
- `/workspaces/client`
  - Client workspace profile
- `/workspaces/agent`
  - Agent workspace profile
- `/workspaces/society-admin`
  - Society admin workspace profile
- `/workspaces/platform-admin`
  - Platform admin workspace profile
- `/modules/[slug]`
  - Banking module execution screen
