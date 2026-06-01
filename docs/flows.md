# Application Flows

## 1. Authentication Flow

```
                        ┌──────────────┐
                        │   User opens  │
                        │   login page  │
                        └──────┬───────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
              Platform    Society      Society
              Login     Staff Login   Client Login
           (/login)  (/CODE/stafflogin) (/CODE/clientlogin)
                   │           │           │
                   └───────────┼───────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  POST /auth/login │
                    │  {username, pass, │
                    │   societyCode,    │
                    │   expectedRole}   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Find user by:     │
                    │ 1. Username match │
                    │ 2. Society code   │
                    │ 3. Loose handle   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Verify:           │
                    │ • Password        │
                    │ • Role match      │
                    │ • Society active  │
                    │ • Aadhaar (if set)│
                    │ • Portal source   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Issue JWT token   │
                    │ Set HTTP-only     │
                    │ cookie            │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Redirect to       │
                    │ role dashboard    │
                    └──────────────────┘
```

## 2. Society Lifecycle

```
  Society Registration          Platform Approval            Active Operations
  ═══════════════════          ══════════════════           ═══════════════════

  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
  │ Admin fills      │         │ SuperAdmin       │         │ Society is       │
  │ registration     │────────▶│ reviews &        │────────▶│ ACTIVE           │
  │ form             │         │ approves         │         │                  │
  └─────────────────┘         └─────────────────┘         └────────┬────────┘
         │                           │                              │
         ▼                           ▼                     ┌───────┼───────┐
  • Society created           • Status → ACTIVE            │       │       │
    (status: PENDING)         • isActive → true          Branches Staff  Members
  • Admin user created        • Admin can login           CRUD    CRUD   CRUD
  • Head Office branch                                      │       │       │
  • Subscription (FREE)                                     ▼       ▼       ▼
                                                         Banking Operations
                                                        (deposits, loans,
                                                         transactions, etc.)
```

## 3. Transaction Flow

```
  ┌──────────────┐     ┌───────────────┐     ┌────────────────┐
  │ Staff/Agent   │     │ Create         │     │ Transaction     │
  │ initiates     │────▶│ Transaction    │────▶│ created with    │
  │ transaction   │     │ (DEBIT/CREDIT) │     │ isPassed=false  │
  └──────────────┘     └───────────────┘     └───────┬────────┘
                                                      │
                                              ┌───────▼────────┐
                                              │ Society Admin   │
                                              │ passes/approves │
                                              │ transaction     │
                                              └───────┬────────┘
                                                      │
                              ┌────────────────────────┼────────────────────┐
                              │                        │                    │
                     ┌────────▼────────┐     ┌────────▼────────┐  ┌───────▼───────┐
                     │ Update account   │     │ Create ledger   │  │ Transaction   │
                     │ currentBalance   │     │ entry with      │  │ isPassed=true │
                     │                  │     │ balanceAfter    │  │ passedAt=now  │
                     └─────────────────┘     └─────────────────┘  └───────────────┘
```

## 4. Working Day Flow

```
  ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
  │ Begin Working  │     │ Daily          │     │ Day End        │
  │ Day            │────▶│ Operations     │────▶│                │
  │ (openedById)   │     │                │     │ (closedById)   │
  └───────────────┘     └───────────────┘     └───────┬───────┘
                                                       │
                                              ┌────────▼────────┐
                                              │ Auto-post all   │
                                              │ unposted        │
                                              │ cashbook entries │
                                              └────────┬────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │ Month End?       │
                                              │ Year End?        │
                                              │ (optional)       │
                                              └─────────────────┘
```

## 5. Payment Collection Flow (Razorpay)

```
  ┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
  │ Society admin │     │ PaymentRequest     │     │ Client sees      │
  │ creates       │────▶│ created            │────▶│ pending request  │
  │ payment       │     │ (status: OPEN)     │     │ in dashboard     │
  │ request       │     └───────────────────┘     └────────┬─────────┘
  └──────────────┘                                         │
                                                  ┌────────▼─────────┐
                                                  │ Client pays via  │
                                                  │ Razorpay         │
                                                  │ (UPI/Card/NB)    │
                                                  └────────┬─────────┘
                                                           │
                                                  ┌────────▼─────────┐
                                                  │ Verify payment   │
                                                  │ signature        │
                                                  └────────┬─────────┘
                                                           │
                                              ┌────────────┼────────────┐
                                              │                         │
                                     ┌────────▼────────┐      ┌───────▼────────┐
                                     │ PaymentTx        │      │ PaymentRequest │
                                     │ status: SUCCESS  │      │ status: PAID   │
                                     └─────────────────┘      └────────────────┘
```

## 6. Module Access Control

```
  User Login
      │
      ▼
  Load allowedModuleSlugs from DB
      │
      ▼
  Each API request:
      │
      ├─ Extract module slug from URL path
      │   e.g. /api/v1/customers/... → "customers"
      │
      ├─ Is module in guardedModuleSlugs?
      │   No  → Allow (unguarded endpoint)
      │   Yes ↓
      │
      └─ Is module in user's allowedModuleSlugs?
          Yes → Allow
          No  → 403 Forbidden

  Default modules by role:
  ┌─────────────┬─────────────────────────────────────────┐
  │ CLIENT      │ customers, accounts, deposits, loans,   │
  │             │ transactions, locker, payments           │
  ├─────────────┼─────────────────────────────────────────┤
  │ AGENT       │ + cheque-clearing, demand-drafts,       │
  │             │   ibc-obc, cashbook, reports             │
  ├─────────────┼─────────────────────────────────────────┤
  │ SUPER_USER  │ + investments, administration, users,   │
  │             │   monitoring                             │
  ├─────────────┼─────────────────────────────────────────┤
  │ SUPER_ADMIN │ monitoring, users, reports, payments    │
  └─────────────┴─────────────────────────────────────────┘
```

## 7. Member Lifecycle Flow

```
  ┌───────────────┐     ┌───────────────┐     ┌───────────────────┐
  │ New member     │     │ Customer       │     │ Member active     │
  │ walks in       │────▶│ created with   │────▶│ (membershipStatus │
  │                │     │ admissionDate  │     │  = ACTIVE)        │
  └───────────────┘     │ admissionFee   │     └────────┬──────────┘
                        │ KYC docs       │              │
                        └───────────────┘     ┌────────┼──────────────────┐
                                              │        │                  │
                                     ┌────────▼──┐  ┌──▼───────┐  ┌─────▼──────┐
                                     │ RESIGNED   │  │ EXPELLED │  │ DECEASED   │
                                     │            │  │          │  │            │
                                     │ Voluntary  │  │ By board │  │ Nominee    │
                                     │ exit,      │  │ decision │  │ claim      │
                                     │ shares     │  │          │  │ process    │
                                     │ surrendered│  │          │  │            │
                                     └────────────┘  └──────────┘  └────────────┘

  Special case: MINOR_TO_ADULT
  ┌────────────────────┐     ┌──────────────────┐
  │ Minor member turns │────▶│ Re-KYC with      │
  │ 18 years old       │     │ adult documents, │
  │                    │     │ full account     │
  │                    │     │ access granted   │
  └────────────────────┘     └──────────────────┘
```

## 8. Share Capital Flow

```
  ┌───────────────┐     ┌───────────────────┐     ┌──────────────────┐
  │ Member buys    │     │ ShareRegister      │     │ Share status:    │
  │ shares at      │────▶│ entry created      │────▶│ ACTIVE           │
  │ admission      │     │ • certificateNo    │     │                  │
  │                │     │ • sharesHeld       │     │ (earns dividend) │
  │                │     │ • faceValue        │     └────────┬─────────┘
  │                │     │ • paidUpValue      │              │
  │                │     └───────────────────┘     ┌────────┼─────────┐
  │                │                               │                  │
  └───────────────┘                       ┌────────▼──────┐  ┌───────▼────────┐
                                          │ SURRENDERED    │  │ FORFEITED      │
                                          │                │  │                │
                                          │ Member resigns │  │ Board decision │
                                          │ → refund       │  │ (expelled,     │
                                          │ paidUpValue    │  │ rule breach)   │
                                          └────────────────┘  └────────────────┘
```

## 9. Dividend Declaration & Payout Flow

```
  ┌──────────────────┐     ┌───────────────────┐     ┌────────────────────┐
  │ Financial year    │     │ Board declares     │     │ DividendDeclaration │
  │ closes            │────▶│ dividend rate      │────▶│ status: DECLARED    │
  │ (isClosed=true)   │     │ on share capital   │     │ ratePercent: X%     │
  └──────────────────┘     └───────────────────┘     └─────────┬──────────┘
                                                               │
                                                      ┌────────▼──────────┐
                                                      │ Admin approves     │
                                                      │ (status: APPROVED) │
                                                      └────────┬──────────┘
                                                               │
                                                      ┌────────▼──────────┐
                                                      │ System generates   │
                                                      │ DividendPayout     │
                                                      │ per active member  │
                                                      │ based on shares ×  │
                                                      │ rate               │
                                                      └────────┬──────────┘
                                                               │
                                              ┌────────────────┼───────────┐
                                              │                            │
                                     ┌────────▼────────┐          ┌───────▼────────┐
                                     │ Credit dividend  │          │ Declaration    │
                                     │ to member's SB   │          │ status: PAID   │
                                     │ account           │          │                │
                                     └─────────────────┘          └────────────────┘

  Cancel path: DECLARED/APPROVED → CANCELLED (before payout)
```

## 10. Financial Year Lifecycle

```
  ┌──────────────────┐     ┌────────────────────┐     ┌──────────────────┐
  │ Society sets      │     │ FinancialYear       │     │ Daily operations │
  │ financialYear     │────▶│ created             │────▶│ within the year  │
  │ Start (default:   │     │ label: "2025-26"    │     │                  │
  │ April = month 4)  │     │ startDate           │     │ Transactions,    │
  └──────────────────┘     │ endDate             │     │ interest calc,   │
                           │ isClosed: false     │     │ deposits, loans  │
                           └────────────────────┘     └────────┬─────────┘
                                                               │
                                                      ┌────────▼─────────┐
                                                      │ Year-end closing  │
                                                      │                   │
                                                      │ • Close all       │
                                                      │   working days    │
                                                      │ • Post interest   │
                                                      │ • Declare         │
                                                      │   dividends       │
                                                      │ • Generate        │
                                                      │   annual reports  │
                                                      │ • isClosed: true  │
                                                      └────────┬─────────┘
                                                               │
                                                      ┌────────▼─────────┐
                                                      │ New FY created    │
                                                      │ automatically     │
                                                      └──────────────────┘
```

## 11. Interest Calculation (Interest Slabs)

```
  ┌──────────────────────┐     ┌──────────────────────────────────┐
  │ Admin configures      │     │ InterestSlab entries:             │
  │ interest slabs        │────▶│                                   │
  │ per account category  │     │ Category: SAVINGS                 │
  └──────────────────────┘     │ ┌──────────┬─────────┬──────────┐│
                               │ │ Range    │ Tenure  │ Rate     ││
                               │ ├──────────┼─────────┼──────────┤│
                               │ │ 0–50K    │ Any     │ 3.5%     ││
                               │ │ 50K–5L   │ Any     │ 4.0%     ││
                               │ │ 5L+      │ Any     │ 4.5%     ││
                               │ └──────────┴─────────┴──────────┘│
                               │                                   │
                               │ Category: FIXED_DEPOSIT            │
                               │ ┌──────────┬─────────┬──────────┐│
                               │ │ Range    │ Tenure  │ Rate     ││
                               │ ├──────────┼─────────┼──────────┤│
                               │ │ Any      │ 6–12M   │ 6.5%     ││
                               │ │ Any      │ 12–24M  │ 7.0%     ││
                               │ │ Any      │ 24M+    │ 7.5%     ││
                               │ └──────────┴─────────┴──────────┘│
                               └──────────────────────────────────┘
                                              │
                                     ┌────────▼────────┐
                                     │ Interest posting │
                                     │ (quarterly/      │
                                     │  half-yearly/    │
                                     │  yearly)         │
                                     │                  │
                                     │ Match account    │
                                     │ balance + tenure │
                                     │ → pick slab      │
                                     │ → calculate      │
                                     │ → credit account │
                                     └─────────────────┘
```

## 12. NPA Classification Flow

```
  ┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
  │ Loan account      │     │ EMI overdue        │     │ Classification   │
  │ (npaClassification│     │ tracking           │     │ escalation       │
  │  = STANDARD)      │────▶│                    │────▶│                  │
  └──────────────────┘     └───────────────────┘     └────────┬─────────┘
                                                              │
                           ┌──────────────────────────────────┼─────────┐
                           │                                  │         │
                  ┌────────▼────────┐              ┌─────────▼───┐  ┌──▼──────────┐
                  │ SUB_STANDARD     │              │ DOUBTFUL     │  │ LOSS         │
                  │                  │              │              │  │              │
                  │ Overdue > 90     │─────────────▶│ Overdue >    │─▶│ Overdue >    │
                  │ days             │              │ 12 months    │  │ 36 months    │
                  │                  │              │              │  │ (write-off   │
                  │ LoanNotice:      │              │ LoanNotice:  │  │ candidate)   │
                  │ DEMAND_NOTICE    │              │ LEGAL_NOTICE │  │              │
                  │ REMINDER         │              │ NPA_NOTICE   │  │ RECOVERY_    │
                  └─────────────────┘              └──────────────┘  │ NOTICE       │
                                                                     └──────────────┘

  Loan Notices:
  ┌────────────────────┐
  │ LoanNotice          │
  │ • noticeType        │
  │ • sentAt            │
  │ • deliveredAt       │
  │ • content (text)    │
  │ • referenceNumber   │
  └────────────────────┘
```

## 13. Standing Instructions Flow

```
  ┌──────────────────┐     ┌───────────────────────┐     ┌──────────────────┐
  │ Member sets up    │     │ StandingInstruction     │     │ Scheduler runs   │
  │ recurring auto-   │────▶│ created                 │────▶│ on working days  │
  │ debit             │     │ • sourceAccountId       │     └────────┬─────────┘
  └──────────────────┘     │ • targetAccountId       │              │
                           │ • amount                │     ┌────────▼─────────┐
                           │ • frequency             │     │ For each SI where │
                           │   (DAILY/WEEKLY/        │     │ nextExecutionAt   │
                           │    MONTHLY/QUARTERLY)   │     │ ≤ today:          │
                           │ • nextExecutionAt       │     │                   │
                           │ • isActive              │     │ 1. Check source   │
                           └───────────────────────┘     │    balance ≥ amt  │
                                                         │ 2. Debit source   │
                                                         │ 3. Credit target  │
                                                         │ 4. Create txn     │
                                                         │ 5. Advance        │
                                                         │    nextExecutionAt│
                                                         └────────┬─────────┘
                                                                  │
                                              ┌───────────────────┼──────────┐
                                              │                              │
                                     ┌────────▼────────┐           ┌────────▼────────┐
                                     │ Success:         │           │ Insufficient    │
                                     │ Transaction      │           │ balance:        │
                                     │ recorded,        │           │ SI skipped,     │
                                     │ ledger updated   │           │ alert generated │
                                     └─────────────────┘           └─────────────────┘

  Common use cases:
  • RD monthly installment (SB → RD account)
  • Loan EMI auto-debit (SB → Loan account)
  • Pigmy daily collection (Agent collects → SB account)
```

## 14. Passbook Printing Flow

```
  ┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
  │ Member requests   │     │ Fetch transactions │     │ Print passbook   │
  │ passbook print    │────▶│ since last print   │────▶│ entries          │
  └──────────────────┘     │                    │     └────────┬─────────┘
                           │ PassbookPrint      │              │
                           │ .lastPrintedTxId   │     ┌────────▼─────────┐
                           │ .lastPrintedAt     │     │ Update           │
                           └───────────────────┘     │ PassbookPrint:   │
                                                     │ lastPrintedTxId  │
                                                     │ = latest txn     │
                                                     │ lastPrintedAt    │
                                                     │ = now            │
                                                     └──────────────────┘
```
