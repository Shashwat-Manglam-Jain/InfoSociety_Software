export type BankingFeatureGroup = {
  description: string;
  workflows: string[];
};

export const bankingFeatureMap: Record<string, BankingFeatureGroup> = {
  customers: {
    description: "Customer onboarding, KYC, nominees, guarantors and account search.",
    workflows: [
      "New customer master creation",
      "Nominee and joint account management",
      "Operating power and guarantor mapping",
      "Search account by customer name"
    ]
  },
  accounts: {
    description: "Deposit and general account lifecycle from opening to closure.",
    workflows: [
      "New account opening",
      "Issue/pass account number",
      "Account modification and status freeze/normal/close",
      "Dormant account transfer and activation"
    ]
  },
  deposits: {
    description: "FD/RD operations including schemes, renewals and maturity reports.",
    workflows: [
      "Deposit scheme master",
      "FD/RD interest provisioning",
      "Single/multiple FD renewals",
      "Deposit period/maturity report pipelines"
    ]
  },
  loans: {
    description: "Loan application, sanction, disbursement, demand, overdue and recovery.",
    workflows: [
      "Loan application and sanction",
      "Overdue transfer and calculation",
      "Loan recovery statements",
      "Loan interest receivable and posting"
    ]
  },
  transactions: {
    description: "Daily transactional core with pass, cancel and modification controls.",
    workflows: [
      "General transaction entry",
      "Single/multiple account ledger passing",
      "Cancel or modify transaction",
      "Pigmy agent and client transaction operations"
    ]
  },
  payments: {
    description: "Member payment requests, digital collections, and agent cash collection tracking.",
    workflows: [
      "Create member payment requests",
      "Collect UPI, card, net banking, or cash payments",
      "Track pending and successful collections",
      "Review payment-wise audit activity"
    ]
  },
  "cheque-clearing": {
    description: "Cheque clearing house entries and return/cancel handling.",
    workflows: [
      "Enter clearing instruments",
      "Cheque modification",
      "Return/cancellation tracking",
      "Clearing statement generation"
    ]
  },
  "demand-drafts": {
    description: "Demand draft issue lifecycle and reconciliation.",
    workflows: [
      "D.D. entry and issuance",
      "D.D. modification",
      "D.D. cancel/clear/return",
      "D.D. daybook and unclear list"
    ]
  },
  "ibc-obc": {
    description: "IBC/OBC instrument entry and settlement pipeline.",
    workflows: [
      "IBC/OBC entry",
      "Instrument return/clear",
      "Instrument-wise daybook",
      "Monthly IBC/OBC reporting"
    ]
  },
  investments: {
    description: "Other bank investment management and maturity monitoring.",
    workflows: [
      "Investment opening",
      "Withdrawal or renewal",
      "Maturity projection",
      "Bank-wise and date-wise reports"
    ]
  },
  locker: {
    description: "Locker allocation, visit logs, closure and charges.",
    workflows: [
      "Locker opening and allotment",
      "Locker visit logging",
      "Locker closure",
      "Locker type and expiry reports"
    ]
  },
  cashbook: {
    description: "Cash book postings, pass flow, deletion, and trial balance linkage.",
    workflows: [
      "Cash book transaction",
      "Pass cash book transaction to GL",
      "Modify mode/remark post pass",
      "Backdated cashbook entries"
    ]
  },
  administration: {
    description: "Operational controls for working day, period close and user governance.",
    workflows: [
      "Working day begin/day end",
      "Month end and year end",
      "User manager",
      "Re-update account and GL balances"
    ]
  },
  reports: {
    description: "Master, enquiry, transactional and statutory reports.",
    workflows: [
      "Daily daybook and scroll reports",
      "Loan/deposit/locker/clearing reports",
      "Profit & loss and balance sheet",
      "Passbook printing and notice printing"
    ]
  },
  users: {
    description: "Authentication users, role management and activity audit baseline.",
    workflows: [
      "User creation and role assignment",
      "Password and username updates",
      "Disable and reactivate users",
      "User-wise statistics"
    ]
  },
  "share-capital": {
    description: "Member share capital management including issuance, surrender and forfeiture.",
    workflows: [
      "Share certificate issuance",
      "Share register maintenance",
      "Share surrender processing",
      "Share forfeiture and status tracking"
    ]
  },
  dividends: {
    description: "Dividend declaration, approval and payout processing for share members.",
    workflows: [
      "Dividend declaration per financial year",
      "Dividend approval workflow",
      "Bulk payout processing for active members",
      "Dividend cancellation and payout reports"
    ]
  },
  "financial-years": {
    description: "Financial year lifecycle management including creation and closure.",
    workflows: [
      "Financial year creation",
      "Year-end closure processing",
      "Financial year statistics and summaries",
      "Link financial years to dividend cycles"
    ]
  },
  "interest-slabs": {
    description: "Interest rate slab configuration by category, amount range and tenure.",
    workflows: [
      "Interest slab creation and categorisation",
      "Rate revision and effective date management",
      "Slab deactivation",
      "Category-wise interest rate reports"
    ]
  },
  "standing-instructions": {
    description: "Recurring auto-debit standing instructions between accounts.",
    workflows: [
      "Standing instruction setup",
      "Frequency and amount modification",
      "Instruction deactivation",
      "Upcoming execution schedule review"
    ]
  },
  "loan-notices": {
    description: "Loan notice generation, tracking and delivery management.",
    workflows: [
      "Demand and reminder notice creation",
      "Legal and NPA notice issuance",
      "Delivery confirmation tracking",
      "Notice history by loan and customer"
    ]
  }
};
