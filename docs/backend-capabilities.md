# Backend Architecture & Integrations

The Infopath application backend is designed to handle high-throughput, highly relational financial data across hundreds of concurrent cooperative societies without data bleed.

---

## 🛠️ The Tech Stack

- **Framework**: `NestJS 11` (Enterprise Node.js framework using progressive TypeScript).
- **ORM**: `Prisma 6` (Automated Type-Safe database client).
- **Database**: `PostgreSQL 15+` (Selected for its ACID compliance which is deeply critical for banking ledgers).
- **Compilation**: By default, we use local SWC builders in NestJS for hyper-fast TypeScript compilation during dev mode.

---

## 🧬 Architectural Patterns

### 1. The Module-Controller-Service Pattern
NestJS inherently forces code into cleanly separated business domains. If you need to build a new feature (e.g. "Gold Loans"), you do not dump everything into a monolithic file. 
You create a `gold-loans.module.ts`, a `gold-loans.controller.ts` (for REST endpoints), and a `gold-loans.service.ts` (for db queries).

### 2. DTO Verification (Data Transfer Objects)
Every single POST and PATCH request is verified using `class-validator` and `class-transformer`.
When a Payload hits the backend, before it even reaches your controller logic, Nest Pipes ensure:
- The data is structured correctly.
- Phone numbers match standard Regex.
- Aadhaar Numbers are exactly 12 strings long.
- No malicious SQL injections bypass the JSON body.

### 3. Transactional Integrity
Because this is a Core Banking System, transferring money requires **Database Transactions**.
If we debit an Agent's virtual collection vault by ₹500 to credit a Client's Savings Account by ₹500, both actions MUST happen simultaneously. If the Client credit fails, the Agent debit MUST Rollback. We use Prisma's `$transaction` API extensively strictly for this purpose.

---

## 🔧 Critical Developer Scripts

When developing the backend, follow these commands from the `apps/api` folder block:

- **Generate Types**: Whenever you alter the `schema.prisma` file, you MUST run this, or TypeScript will throw errors:
  ```bash
  npm run prisma:generate --workspace=@infopath/api
  ```

- **Database Migrations**: When adding a new column to a table:
  ```bash
  npm run prisma:migrate --workspace=@infopath/api
  ```

- **Seeding Real Data**: We have built a heavy, highly relational mock database in `prisma/seed.ts` that includes dummy Societies, Lockers, FDs, and Auth hashes.
  ```bash
  npm run prisma:seed --workspace=@infopath/api
  ```

## 🔌 API Documentation (Swagger)

NestJS automatically generates an OpenAPI (Swagger) interface for us.
When the API is running locally via `npm run dev:api`, you can navigate to:
👉 **[http://localhost:4000/api/docs](http://localhost:4000/api/docs)**

This provides a beautiful UI where you can visually see every single API endpoint, the JSON bodies they expect, and even fire test requests directly from the browser!
