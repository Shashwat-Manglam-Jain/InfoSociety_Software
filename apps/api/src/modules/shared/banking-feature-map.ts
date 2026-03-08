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
  }
};
