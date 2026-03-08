import type { ModuleWorkspaceConfig, OperationField } from "./types";

const accountTypeOptions = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
  { label: "Fixed Deposit", value: "FIXED_DEPOSIT" },
  { label: "Recurring Deposit", value: "RECURRING_DEPOSIT" },
  { label: "Loan", value: "LOAN" },
  { label: "Pigmy", value: "PIGMY" },
  { label: "General", value: "GENERAL" }
];

const accountStatusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Frozen", value: "FROZEN" },
  { label: "Dormant", value: "DORMANT" },
  { label: "Closed", value: "CLOSED" }
];

const transactionTypeOptions = [
  { label: "Debit", value: "DEBIT" },
  { label: "Credit", value: "CREDIT" }
];

const transactionModeOptions = [
  { label: "Cash", value: "CASH" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "Adjustment", value: "ADJUSTMENT" }
];

const instrumentStatusOptions = [
  { label: "Entered", value: "ENTERED" },
  { label: "Cleared", value: "CLEARED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Cancelled", value: "CANCELLED" }
];

const loanStatusOptions = [
  { label: "Applied", value: "APPLIED" },
  { label: "Sanctioned", value: "SANCTIONED" },
  { label: "Disbursed", value: "DISBURSED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Overdue", value: "OVERDUE" }
];

const lockerSizeOptions = [
  { label: "Small", value: "SMALL" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Large", value: "LARGE" }
];

const ibcObcTypeOptions = [
  { label: "IBC", value: "IBC" },
  { label: "OBC", value: "OBC" }
];

const reportStatusOptions = [
  { label: "Queued", value: "QUEUED" },
  { label: "Running", value: "RUNNING" },
  { label: "Done", value: "DONE" },
  { label: "Failed", value: "FAILED" }
];

const boolOptions = [
  { label: "True", value: "true" },
  { label: "False", value: "false" }
];

function pathIdField(label: string): OperationField {
  return {
    key: "id",
    label,
    type: "text",
    location: "path",
    required: true,
    placeholder: "UUID"
  };
}

export const moduleOperationCatalog: ModuleWorkspaceConfig[] = [
  {
    slug: "customers",
    operations: [
      {
        id: "customers-list",
        title: "List Customers",
        description: "Search and paginate customer masters.",
        method: "GET",
        path: "/customers",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "customers-me",
        title: "My Customer Profile",
        description: "Client self profile endpoint.",
        method: "GET",
        path: "/customers/me"
      },
      {
        id: "customers-get-by-id",
        title: "Get Customer By ID",
        description: "Fetch customer with account list.",
        method: "GET",
        path: "/customers/:id",
        fields: [pathIdField("Customer ID")]
      },
      {
        id: "customers-create",
        title: "Create Customer",
        description: "Create new customer master record.",
        method: "POST",
        path: "/customers",
        fields: [
          { key: "societyCode", label: "Society Code", type: "text", location: "body" },
          { key: "firstName", label: "First Name", type: "text", location: "body", required: true },
          { key: "lastName", label: "Last Name", type: "text", location: "body" },
          { key: "phone", label: "Phone", type: "text", location: "body" },
          { key: "email", label: "Email", type: "text", location: "body" },
          { key: "address", label: "Address", type: "text", location: "body" },
          { key: "kycVerified", label: "KYC Verified", type: "select", options: boolOptions, location: "body" }
        ]
      },
      {
        id: "customers-update",
        title: "Update Customer",
        description: "Modify customer details.",
        method: "PATCH",
        path: "/customers/:id",
        fields: [
          pathIdField("Customer ID"),
          { key: "firstName", label: "First Name", type: "text", location: "body" },
          { key: "lastName", label: "Last Name", type: "text", location: "body" },
          { key: "phone", label: "Phone", type: "text", location: "body" },
          { key: "email", label: "Email", type: "text", location: "body" },
          { key: "address", label: "Address", type: "text", location: "body" },
          { key: "kycVerified", label: "KYC Verified", type: "select", options: boolOptions, location: "body" }
        ]
      }
    ]
  },
  {
    slug: "accounts",
    operations: [
      {
        id: "accounts-list",
        title: "List Accounts",
        description: "Search account records and filter by status/type.",
        method: "GET",
        path: "/accounts",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "type", label: "Type", type: "select", options: accountTypeOptions, location: "query" },
          { key: "status", label: "Status", type: "select", options: accountStatusOptions, location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "customerId", label: "Customer ID", type: "text", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "accounts-get",
        title: "Get Account By ID",
        description: "Fetch account profile with linked entities.",
        method: "GET",
        path: "/accounts/:id",
        fields: [pathIdField("Account ID")]
      },
      {
        id: "accounts-create",
        title: "Create Account",
        description: "Open a new account for an existing customer.",
        method: "POST",
        path: "/accounts",
        fields: [
          { key: "customerId", label: "Customer ID", type: "text", location: "body", required: true },
          { key: "type", label: "Account Type", type: "select", options: accountTypeOptions, location: "body", required: true },
          { key: "accountNumber", label: "Account Number (optional)", type: "text", location: "body" },
          { key: "openingBalance", label: "Opening Balance", type: "number", location: "body" },
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body" },
          { key: "branchCode", label: "Branch Code", type: "text", location: "body" },
          { key: "isPassbookEnabled", label: "Passbook Enabled", type: "select", options: boolOptions, location: "body" }
        ]
      },
      {
        id: "accounts-update",
        title: "Update Account",
        description: "Update account maintenance attributes.",
        method: "PATCH",
        path: "/accounts/:id",
        fields: [
          pathIdField("Account ID"),
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body" },
          { key: "branchCode", label: "Branch Code", type: "text", location: "body" },
          { key: "isPassbookEnabled", label: "Passbook Enabled", type: "select", options: boolOptions, location: "body" }
        ]
      },
      {
        id: "accounts-status",
        title: "Update Account Status",
        description: "Freeze/activate/close account status.",
        method: "PATCH",
        path: "/accounts/:id/status",
        fields: [
          pathIdField("Account ID"),
          {
            key: "status",
            label: "Status",
            type: "select",
            options: accountStatusOptions,
            location: "body",
            required: true
          }
        ]
      }
    ]
  },
  {
    slug: "deposits",
    operations: [
      {
        id: "deposits-scheme-list",
        title: "List Deposit Schemes",
        description: "View FD/RD scheme master entries.",
        method: "GET",
        path: "/deposits/schemes"
      },
      {
        id: "deposits-scheme-create",
        title: "Create Deposit Scheme",
        description: "Create a new deposit interest scheme.",
        method: "POST",
        path: "/deposits/schemes",
        fields: [
          { key: "code", label: "Scheme Code", type: "text", location: "body", required: true },
          { key: "name", label: "Scheme Name", type: "text", location: "body", required: true },
          { key: "minMonths", label: "Min Months", type: "number", location: "body", required: true },
          { key: "maxMonths", label: "Max Months", type: "number", location: "body", required: true },
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body", required: true },
          { key: "recurring", label: "Recurring", type: "select", options: boolOptions, location: "body", required: true }
        ]
      },
      {
        id: "deposits-list",
        title: "List Deposit Accounts",
        description: "List FD/RD account records.",
        method: "GET",
        path: "/deposits",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "maturityBefore", label: "Maturity Before", type: "date", location: "query" },
          { key: "recurring", label: "Recurring", type: "select", options: boolOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "deposits-open",
        title: "Open Deposit Record",
        description: "Attach deposit details to FD/RD account.",
        method: "POST",
        path: "/deposits/open",
        fields: [
          { key: "accountId", label: "Account ID", type: "text", location: "body", required: true },
          { key: "schemeId", label: "Scheme ID", type: "text", location: "body", required: true },
          { key: "principalAmount", label: "Principal", type: "number", location: "body", required: true },
          { key: "durationMonths", label: "Duration Months", type: "number", location: "body" },
          { key: "startDate", label: "Start Date", type: "date", location: "body" }
        ]
      },
      {
        id: "deposits-renew",
        title: "Renew Deposit",
        description: "Renew matured deposit with new tenure.",
        method: "POST",
        path: "/deposits/:id/renew",
        fields: [
          pathIdField("Deposit ID"),
          { key: "durationMonths", label: "Duration Months", type: "number", location: "body" },
          { key: "principalAmount", label: "Principal", type: "number", location: "body" },
          { key: "startDate", label: "Start Date", type: "date", location: "body" }
        ]
      },
      {
        id: "deposits-lien",
        title: "Update Lien Mark",
        description: "Mark or remove deposit lien.",
        method: "PATCH",
        path: "/deposits/:id/lien",
        fields: [
          pathIdField("Deposit ID"),
          { key: "lienMarked", label: "Lien Marked", type: "select", options: boolOptions, location: "body", required: true }
        ]
      }
    ]
  },
  {
    slug: "loans",
    operations: [
      {
        id: "loans-list",
        title: "List Loans",
        description: "List loan accounts by status/customer/society.",
        method: "GET",
        path: "/loans",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "status", label: "Status", type: "select", options: loanStatusOptions, location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "customerId", label: "Customer ID", type: "text", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "loans-apply",
        title: "Apply Loan",
        description: "Create loan application against customer.",
        method: "POST",
        path: "/loans/apply",
        fields: [
          { key: "customerId", label: "Customer ID", type: "text", location: "body", required: true },
          { key: "accountId", label: "Account ID (optional)", type: "text", location: "body" },
          { key: "applicationAmount", label: "Application Amount", type: "number", location: "body", required: true },
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body", required: true },
          { key: "expiryDate", label: "Expiry Date", type: "date", location: "body" }
        ]
      },
      {
        id: "loans-sanction",
        title: "Sanction Loan",
        description: "Approve and sanction applied loan.",
        method: "POST",
        path: "/loans/:id/sanction",
        fields: [
          pathIdField("Loan ID"),
          { key: "sanctionedAmount", label: "Sanctioned Amount", type: "number", location: "body", required: true },
          { key: "sanctionDate", label: "Sanction Date", type: "date", location: "body" },
          { key: "expiryDate", label: "Expiry Date", type: "date", location: "body" }
        ]
      },
      {
        id: "loans-disburse",
        title: "Disburse Loan",
        description: "Disburse sanctioned loan amount.",
        method: "POST",
        path: "/loans/:id/disburse",
        fields: [
          pathIdField("Loan ID"),
          { key: "amount", label: "Disbursement Amount", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "loans-recover",
        title: "Recover Loan",
        description: "Record loan recovery amount.",
        method: "POST",
        path: "/loans/:id/recover",
        fields: [
          pathIdField("Loan ID"),
          { key: "amount", label: "Recovery Amount", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "loans-overdue",
        title: "Update Overdue",
        description: "Update overdue amount for loan account.",
        method: "PATCH",
        path: "/loans/:id/overdue",
        fields: [
          pathIdField("Loan ID"),
          { key: "overdueAmount", label: "Overdue Amount", type: "number", location: "body", required: true }
        ]
      }
    ]
  },
  {
    slug: "transactions",
    operations: [
      {
        id: "transactions-list",
        title: "List Transactions",
        description: "Search account transactions and pass-state.",
        method: "GET",
        path: "/transactions",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "accountId", label: "Account ID", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "isPassed", label: "Is Passed", type: "select", options: boolOptions, location: "query" },
          { key: "type", label: "Type", type: "select", options: transactionTypeOptions, location: "query" },
          { key: "mode", label: "Mode", type: "select", options: transactionModeOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "transactions-create",
        title: "Create Transaction",
        description: "Create debit/credit transaction entry.",
        method: "POST",
        path: "/transactions",
        fields: [
          { key: "accountId", label: "Account ID", type: "text", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true },
          { key: "type", label: "Type", type: "select", options: transactionTypeOptions, location: "body", required: true },
          { key: "mode", label: "Mode", type: "select", options: transactionModeOptions, location: "body", required: true },
          { key: "remark", label: "Remark", type: "text", location: "body" },
          { key: "valueDate", label: "Value Date", type: "date", location: "body" }
        ]
      },
      {
        id: "transactions-pass",
        title: "Pass Transaction",
        description: "Post transaction and create ledger impact.",
        method: "POST",
        path: "/transactions/:id/pass",
        fields: [pathIdField("Transaction ID")]
      },
      {
        id: "transactions-update",
        title: "Update Transaction",
        description: "Modify pre-pass transaction or mode/remark after pass.",
        method: "PATCH",
        path: "/transactions/:id",
        fields: [
          pathIdField("Transaction ID"),
          { key: "amount", label: "Amount", type: "number", location: "body" },
          { key: "type", label: "Type", type: "select", options: transactionTypeOptions, location: "body" },
          { key: "mode", label: "Mode", type: "select", options: transactionModeOptions, location: "body" },
          { key: "remark", label: "Remark", type: "text", location: "body" }
        ]
      },
      {
        id: "transactions-cancel",
        title: "Cancel Transaction",
        description: "Cancel or reverse a transaction.",
        method: "POST",
        path: "/transactions/:id/cancel",
        fields: [pathIdField("Transaction ID"), { key: "reason", label: "Reason", type: "text", location: "body" }]
      }
    ]
  },
  {
    slug: "cheque-clearing",
    operations: [
      {
        id: "cheque-list",
        title: "List Cheque Entries",
        description: "List and search cheque clearing records.",
        method: "GET",
        path: "/cheque-clearing",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "cheque-create",
        title: "Create Clearing Entry",
        description: "Create new cheque entry for clearing.",
        method: "POST",
        path: "/cheque-clearing",
        fields: [
          { key: "chequeNumber", label: "Cheque Number", type: "text", location: "body", required: true },
          { key: "accountId", label: "Account ID", type: "text", location: "body" },
          { key: "bankName", label: "Bank Name", type: "text", location: "body", required: true },
          { key: "branchName", label: "Branch Name", type: "text", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "cheque-update",
        title: "Update Cheque Entry",
        description: "Modify entered cheque details.",
        method: "PATCH",
        path: "/cheque-clearing/:id",
        fields: [
          pathIdField("Cheque Entry ID"),
          { key: "bankName", label: "Bank Name", type: "text", location: "body" },
          { key: "branchName", label: "Branch Name", type: "text", location: "body" },
          { key: "amount", label: "Amount", type: "number", location: "body" }
        ]
      },
      {
        id: "cheque-status",
        title: "Update Cheque Status",
        description: "Clear/return/cancel cheque entry.",
        method: "PATCH",
        path: "/cheque-clearing/:id/status",
        fields: [
          pathIdField("Cheque Entry ID"),
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "body", required: true }
        ]
      }
    ]
  },
  {
    slug: "demand-drafts",
    operations: [
      {
        id: "dd-list",
        title: "List Demand Drafts",
        description: "List and search demand drafts.",
        method: "GET",
        path: "/demand-drafts",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "dd-create",
        title: "Issue Demand Draft",
        description: "Create demand draft issuance record.",
        method: "POST",
        path: "/demand-drafts",
        fields: [
          { key: "accountId", label: "Account ID", type: "text", location: "body" },
          { key: "customerId", label: "Customer ID", type: "text", location: "body" },
          { key: "beneficiary", label: "Beneficiary", type: "text", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "dd-update",
        title: "Modify Demand Draft",
        description: "Update draft before final settlement.",
        method: "PATCH",
        path: "/demand-drafts/:id",
        fields: [
          pathIdField("Draft ID"),
          { key: "beneficiary", label: "Beneficiary", type: "text", location: "body" },
          { key: "amount", label: "Amount", type: "number", location: "body" }
        ]
      },
      {
        id: "dd-status",
        title: "Update Draft Status",
        description: "Mark draft clear/return/cancel.",
        method: "PATCH",
        path: "/demand-drafts/:id/status",
        fields: [
          pathIdField("Draft ID"),
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "body", required: true }
        ]
      }
    ]
  },
  {
    slug: "ibc-obc",
    operations: [
      {
        id: "ibc-obc-list",
        title: "List Instruments",
        description: "List IBC/OBC entries.",
        method: "GET",
        path: "/ibc-obc",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "type", label: "Type", type: "select", options: ibcObcTypeOptions, location: "query" },
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "ibc-obc-create",
        title: "Create Instrument",
        description: "Create inward/outward instrument entry.",
        method: "POST",
        path: "/ibc-obc",
        fields: [
          { key: "instrumentNumber", label: "Instrument Number", type: "text", location: "body", required: true },
          { key: "type", label: "Type", type: "select", options: ibcObcTypeOptions, location: "body", required: true },
          { key: "accountId", label: "Account ID", type: "text", location: "body" },
          { key: "customerId", label: "Customer ID", type: "text", location: "body" },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "ibc-obc-status",
        title: "Update Instrument Status",
        description: "Resolve IBC/OBC entry status.",
        method: "PATCH",
        path: "/ibc-obc/:id/status",
        fields: [
          pathIdField("Instrument ID"),
          { key: "status", label: "Status", type: "select", options: instrumentStatusOptions, location: "body", required: true }
        ]
      }
    ]
  },
  {
    slug: "investments",
    operations: [
      {
        id: "investments-list",
        title: "List Investments",
        description: "List all bank investments.",
        method: "GET",
        path: "/investments",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "maturityBefore", label: "Maturity Before", type: "date", location: "query" },
          { key: "activeOnly", label: "Active Only", type: "select", options: boolOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "investments-create",
        title: "Create Investment",
        description: "Create new treasury investment record.",
        method: "POST",
        path: "/investments",
        fields: [
          { key: "bankName", label: "Bank Name", type: "text", location: "body", required: true },
          { key: "investmentType", label: "Investment Type", type: "text", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true },
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body", required: true },
          { key: "startDate", label: "Start Date", type: "date", location: "body", required: true },
          { key: "maturityDate", label: "Maturity Date", type: "date", location: "body", required: true },
          { key: "maturityAmount", label: "Maturity Amount", type: "number", location: "body" }
        ]
      },
      {
        id: "investments-renew",
        title: "Renew Investment",
        description: "Renew matured investment entry.",
        method: "POST",
        path: "/investments/:id/renew",
        fields: [
          pathIdField("Investment ID"),
          { key: "startDate", label: "Start Date", type: "date", location: "body" },
          { key: "maturityDate", label: "Maturity Date", type: "date", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body" },
          { key: "interestRate", label: "Interest Rate", type: "number", location: "body" }
        ]
      },
      {
        id: "investments-withdraw",
        title: "Withdraw Investment",
        description: "Mark investment as withdrawn.",
        method: "POST",
        path: "/investments/:id/withdraw",
        fields: [
          pathIdField("Investment ID"),
          { key: "withdrawnDate", label: "Withdrawn Date", type: "date", location: "body" },
          { key: "maturityAmount", label: "Maturity Amount", type: "number", location: "body" }
        ]
      }
    ]
  },
  {
    slug: "locker",
    operations: [
      {
        id: "locker-list",
        title: "List Lockers",
        description: "List locker allocation records.",
        method: "GET",
        path: "/locker",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          {
            key: "status",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "ACTIVE" },
              { label: "Closed", value: "CLOSED" },
              { label: "Expired", value: "EXPIRED" }
            ],
            location: "query"
          },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "locker-create",
        title: "Open Locker",
        description: "Allocate locker to customer.",
        method: "POST",
        path: "/locker",
        fields: [
          { key: "customerId", label: "Customer ID", type: "text", location: "body", required: true },
          { key: "lockerNumber", label: "Locker Number", type: "text", location: "body", required: true },
          { key: "size", label: "Size", type: "select", options: lockerSizeOptions, location: "body", required: true },
          { key: "annualCharge", label: "Annual Charge", type: "number", location: "body", required: true }
        ]
      },
      {
        id: "locker-visit",
        title: "Record Locker Visit",
        description: "Track locker visit time/event.",
        method: "POST",
        path: "/locker/:id/visit",
        fields: [pathIdField("Locker ID"), { key: "remarks", label: "Remarks", type: "text", location: "body" }]
      },
      {
        id: "locker-close",
        title: "Close Locker",
        description: "Close allocated locker.",
        method: "POST",
        path: "/locker/:id/close",
        fields: [pathIdField("Locker ID"), { key: "reason", label: "Reason", type: "text", location: "body" }]
      },
      {
        id: "locker-visits",
        title: "List Locker Visits",
        description: "Fetch all visits for one locker.",
        method: "GET",
        path: "/locker/:id/visits",
        fields: [pathIdField("Locker ID")]
      }
    ]
  },
  {
    slug: "cashbook",
    operations: [
      {
        id: "cashbook-list",
        title: "List Cashbook Entries",
        description: "Search cashbook records and posting status.",
        method: "GET",
        path: "/cashbook",
        fields: [
          { key: "q", label: "Search", type: "text", location: "query" },
          { key: "societyCode", label: "Society Code", type: "text", location: "query" },
          { key: "isPosted", label: "Is Posted", type: "select", options: boolOptions, location: "query" },
          { key: "date", label: "Date", type: "date", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "cashbook-create",
        title: "Create Cashbook Entry",
        description: "Create daily cashbook voucher.",
        method: "POST",
        path: "/cashbook",
        fields: [
          { key: "headCode", label: "Head Code", type: "text", location: "body", required: true },
          { key: "headName", label: "Head Name", type: "text", location: "body", required: true },
          { key: "amount", label: "Amount", type: "number", location: "body", required: true },
          { key: "type", label: "Type", type: "select", options: transactionTypeOptions, location: "body", required: true },
          { key: "mode", label: "Mode", type: "select", options: transactionModeOptions, location: "body", required: true },
          { key: "remark", label: "Remark", type: "text", location: "body" },
          { key: "entryDate", label: "Entry Date", type: "date", location: "body" }
        ]
      },
      {
        id: "cashbook-update",
        title: "Update Cashbook Entry",
        description: "Modify mode/remark.",
        method: "PATCH",
        path: "/cashbook/:id",
        fields: [
          pathIdField("Entry ID"),
          { key: "mode", label: "Mode", type: "select", options: transactionModeOptions, location: "body" },
          { key: "remark", label: "Remark", type: "text", location: "body" }
        ]
      },
      {
        id: "cashbook-pass-one",
        title: "Pass One Entry",
        description: "Post one cashbook entry.",
        method: "POST",
        path: "/cashbook/:id/pass",
        fields: [pathIdField("Entry ID")]
      },
      {
        id: "cashbook-pass-day",
        title: "Pass Day Entries",
        description: "Post all pending entries for a date.",
        method: "POST",
        path: "/cashbook/pass-day",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      },
      {
        id: "cashbook-delete",
        title: "Delete Cashbook Entry",
        description: "Delete one entry.",
        method: "DELETE",
        path: "/cashbook/:id",
        fields: [pathIdField("Entry ID")]
      }
    ]
  },
  {
    slug: "administration",
    operations: [
      {
        id: "admin-working-days",
        title: "List Working Days",
        description: "List day begin/end history.",
        method: "GET",
        path: "/administration/working-days",
        fields: [
          { key: "from", label: "From", type: "date", location: "query" },
          { key: "to", label: "To", type: "date", location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "admin-working-day-begin",
        title: "Working Day Begin",
        description: "Begin working day for transaction date.",
        method: "POST",
        path: "/administration/working-day/begin",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      },
      {
        id: "admin-working-day-end",
        title: "Working Day End",
        description: "Run day-end with auto cashbook posting.",
        method: "POST",
        path: "/administration/working-day/end",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      },
      {
        id: "admin-month-end",
        title: "Month End",
        description: "Execute month-end marker.",
        method: "POST",
        path: "/administration/month-end",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      },
      {
        id: "admin-year-end",
        title: "Year End",
        description: "Execute year-end marker.",
        method: "POST",
        path: "/administration/year-end",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      },
      {
        id: "admin-users",
        title: "List Users",
        description: "User manager listing.",
        method: "GET",
        path: "/administration/users"
      },
      {
        id: "admin-user-status",
        title: "Update User Status",
        description: "Enable/disable user account.",
        method: "PATCH",
        path: "/administration/users/:id/status",
        fields: [
          pathIdField("User ID"),
          { key: "isActive", label: "Is Active", type: "select", options: boolOptions, location: "body", required: true }
        ]
      },
      {
        id: "admin-recompute-account",
        title: "Recompute Account Balance",
        description: "Rebuild account balance from passed transactions.",
        method: "POST",
        path: "/administration/recompute/account/:id",
        fields: [pathIdField("Account ID"), { key: "fromDate", label: "From Date", type: "date", location: "body" }]
      },
      {
        id: "admin-recompute-gl",
        title: "Recompute GL Snapshot",
        description: "Compute day GL style summary from posted cashbook.",
        method: "POST",
        path: "/administration/recompute/gl",
        fields: [{ key: "date", label: "Date", type: "date", location: "body" }]
      }
    ]
  },
  {
    slug: "reports",
    operations: [
      {
        id: "reports-catalog",
        title: "Get Report Catalog",
        description: "Fetch available report names by category.",
        method: "GET",
        path: "/reports/catalog"
      },
      {
        id: "reports-run",
        title: "Run Report",
        description: "Queue/execute report generation.",
        method: "POST",
        path: "/reports/run",
        fields: [
          { key: "category", label: "Category", type: "text", location: "body", required: true },
          { key: "reportName", label: "Report Name", type: "text", location: "body", required: true },
          {
            key: "parameters",
            label: "Parameters JSON",
            type: "json",
            location: "body",
            placeholder: '{"fromDate":"2026-01-01","toDate":"2026-01-31"}'
          }
        ]
      },
      {
        id: "reports-jobs",
        title: "List Report Jobs",
        description: "List generated report jobs.",
        method: "GET",
        path: "/reports/jobs",
        fields: [
          { key: "category", label: "Category", type: "text", location: "query" },
          { key: "status", label: "Status", type: "select", options: reportStatusOptions, location: "query" },
          { key: "page", label: "Page", type: "number", location: "query", defaultValue: "1" },
          { key: "limit", label: "Limit", type: "number", location: "query", defaultValue: "10" }
        ]
      },
      {
        id: "reports-job",
        title: "Get Report Job",
        description: "Fetch one report job status and payload.",
        method: "GET",
        path: "/reports/jobs/:id",
        fields: [pathIdField("Job ID")]
      }
    ]
  },
  {
    slug: "users",
    operations: [
      {
        id: "users-directory",
        title: "User Directory",
        description: "List users by role and society scope.",
        method: "GET",
        path: "/users/directory"
      }
    ]
  },
  {
    slug: "monitoring",
    operations: [
      {
        id: "monitoring-overview",
        title: "Monitoring Overview",
        description: "Global or assigned society KPI overview.",
        method: "GET",
        path: "/monitoring/overview"
      },
      {
        id: "monitoring-societies",
        title: "List Societies",
        description: "List societies with counts.",
        method: "GET",
        path: "/monitoring/societies"
      },
      {
        id: "monitoring-create-society",
        title: "Create Society",
        description: "Create new society (superuser only).",
        method: "POST",
        path: "/monitoring/societies",
        fields: [
          { key: "code", label: "Society Code", type: "text", location: "body", required: true },
          { key: "name", label: "Society Name", type: "text", location: "body", required: true }
        ]
      }
    ]
  }
];

export function getModuleWorkspaceConfig(slug: string): ModuleWorkspaceConfig | undefined {
  return moduleOperationCatalog.find((item) => item.slug === slug);
}
