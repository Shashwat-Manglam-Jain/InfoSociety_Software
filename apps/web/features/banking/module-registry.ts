export type BankingModule = {
  slug: string;
  name: string;
  summary: string;
  endpoints: string[];
};

export const modules: BankingModule[] = [
  {
    slug: "customers",
    name: "Customer & KYC",
    summary: "Master customer records, nominee/joint details, and onboarding workflow.",
    endpoints: ["/customers", "/customers/:id", "/customers/me"]
  },
  {
    slug: "accounts",
    name: "Account Opening & Maintenance",
    summary: "Savings/current/deposit account lifecycle, account status, and modifications.",
    endpoints: ["/accounts", "/accounts/:id", "/accounts/:id/status"]
  },
  {
    slug: "deposits",
    name: "Deposit Management",
    summary: "FD/RD schemes, renewal, maturity, provision interest, and lien handling.",
    endpoints: ["/deposits", "/deposits/schemes", "/deposits/:id/renew", "/deposits/:id/lien"]
  },
  {
    slug: "loans",
    name: "Loan Management",
    summary: "Loan applications, sanction/disbursement, recovery and overdue calculation.",
    endpoints: ["/loans", "/loans/apply", "/loans/:id/sanction", "/loans/:id/disburse", "/loans/:id/recover"]
  },
  {
    slug: "transactions",
    name: "Transactions & Passing",
    summary: "General transaction entry, pass/cancel/modify, and ledger posting flows.",
    endpoints: ["/transactions", "/transactions/:id/pass", "/transactions/:id/cancel", "/transactions/:id"]
  },
  {
    slug: "cheque-clearing",
    name: "Cheque Clearing House",
    summary: "Cheque entry, return/cancellation, and clearing lifecycle management.",
    endpoints: ["/cheque-clearing", "/cheque-clearing/:id/status", "/cheque-clearing/:id"]
  },
  {
    slug: "demand-drafts",
    name: "Demand Drafts",
    summary: "Issue, modify, clear, return and report demand drafts.",
    endpoints: ["/demand-drafts", "/demand-drafts/:id/status", "/demand-drafts/:id"]
  },
  {
    slug: "ibc-obc",
    name: "IBC/OBC Instruments",
    summary: "Inward/outward bill collection entry and return/clear processing.",
    endpoints: ["/ibc-obc", "/ibc-obc/:id/status"]
  },
  {
    slug: "investments",
    name: "Bank Investments",
    summary: "Other bank investments, renewal/withdrawal and maturity tracking.",
    endpoints: ["/investments", "/investments/:id/renew", "/investments/:id/withdraw"]
  },
  {
    slug: "locker",
    name: "Locker",
    summary: "Locker allocation, visits, expiry and charge tracking.",
    endpoints: ["/locker", "/locker/:id/visit", "/locker/:id/close", "/locker/:id/visits"]
  },
  {
    slug: "cashbook",
    name: "Cash Book & Trial Balance",
    summary: "Cashbook entry, pass flow, backdated entries and trial balance linkage.",
    endpoints: ["/cashbook", "/cashbook/:id/pass", "/cashbook/pass-day"]
  },
  {
    slug: "administration",
    name: "Administration",
    summary: "Working day control, user manager, month/year end and re-update tools.",
    endpoints: ["/administration/working-day/begin", "/administration/working-day/end", "/administration/month-end"]
  },
  {
    slug: "reports",
    name: "Reports & Enquiries",
    summary: "Daily books, statements, balance sheet, PL, recovery and analytics reports.",
    endpoints: ["/reports/catalog", "/reports/run", "/reports/jobs", "/reports/jobs/:id"]
  },
  {
    slug: "users",
    name: "User Directory",
    summary: "Role-based user listing and administration visibility.",
    endpoints: ["/users/directory"]
  },
  {
    slug: "monitoring",
    name: "Society Monitoring",
    summary: "Society list, global overview, and superuser monitoring controls.",
    endpoints: ["/monitoring/societies", "/monitoring/overview"]
  }
];
