# Role Access & Security Matrix (RBAC)

The Infopath Society Savings platform employs a robust, highly-granular **Role-Based Access Control (RBAC)** architecture to guarantee that across thousands of potential users, nobody accidentally touches the wrong financial lever.

The system relies on two layers of security:
1. **Vertical Isolation**: JWT tokens are bound to a strict `societyCode`. A user inside Society A has a completely different JWT hash signature than a user in Society B, creating an impenetrable tenant wall.
2. **Horizontal Isolation**: Inside a single Society, users are divided into strict `Roles` determining their horizontal access plane.

---

## 🛡️ Core Roles Description

### 1. `PLATFORM_ADMIN` (Infopath Corporate Level)
- **Who they are:** The maintainers of the SaaS software.
- **Access Level:** Global. They do NOT engage in individual society banking.
- **Permitted Actions:** Approving new Society registrations, viewing macro platform metrics, suspending societies that fail to pay their SaaS subscription.
- **Portal:** `/admin`

### 2. `SUPER_USER` (Head Office Society Admin)
- **Who they are:** The CEO, Branch Manager, or lead accountant of a specific Cooperative Society.
- **Access Level:** Institutional Maximum.
- **Permitted Actions:** Can see everything happening within their specific society mapping. Approving loan disbursements, finalizing cheque clearings, printing Day Book reports, and creating Field Agents.
- **Requirement:** Logging in MUST include the last 4 digits of their officially registered Aadhaar card.
- **Portal:** `/dashboard/society`

### 3. `AGENT` (Field Operative / Pigmy Teller)
- **Who they are:** Remote workers out in the local towns collecting daily savings (Pigmy) from rural clientele or market shopkeepers.
- **Access Level:** Collection mapping only.
- **Permitted Actions:** Can look up clientele assigned to their collection zone. Can initiate a "collection receipt". They CANNOT approve loans, cannot open FDs, and cannot alter society configuration.
- **Portal:** `/dashboard/agent`

### 4. `CLIENT` (Standard Society Member)
- **Who they are:** The end-consumer holding the bank account.
- **Access Level:** B2C Passbook only.
- **Permitted Actions:** Can view their own account balance, pay an outstanding Loan EMI digitally, request an appointment to visit their physical locker, and download PDF account statements.
- **Portal:** `/dashboard/client`

---

## 🔒 The Tab/Module Capability System (`allowedModuleSlugs`)

To prevent the User Interface from being cluttered, we use a concept of "Capabilities" or "Module Slugs". Even if to tellers are both `SUPER_USER`, one might be a Loan Officer and the other a Locker Manager. 

By defining `allowedModuleSlugs` as an array of strings strings on the User table, the frontend dynamically hides or renders Side-Navigation links.

**Available Slugs Example:**
- `modules/loans`
- `modules/lockers`
- `modules/cashbook`
- `modules/investments`

If an API request is made to a Controller for `/api/v1/banking/loans`, the backend explicitly checks if the decoded JWT token payload includes `modules/loans` in its allowed slugs array. If missing, it throws a `403 Forbidden`.
