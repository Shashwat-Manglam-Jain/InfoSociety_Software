export type BranchOption = {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
};

export type AgentOption = {
  id: string;
  name: string;
  code: string;
};

export type VerificationLog = {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  remark: string;
};

export type KycEntry = {
  number: string;
  verified: boolean;
  verifiedOn: string;
  remark: string;
  documentLabel: string;
};

export type MemberDocument = {
  id: string;
  type: "Photo" | "Document";
  name: string;
  documentNumber: string;
  fileLabel: string;
  updatedAt: string;
  status: "Pending" | "Verified" | "Needs Review";
};

export type MemberBankAccount = {
  id: string;
  bankName: string;
  branch: string;
  accountType: string;
  accountNumber: string;
  ifsc: string;
  status: string;
};

export type LoanLink = {
  id: string;
  purpose: string;
  sanctionedAmount: number;
  accountNo: string;
  accountType: string;
  accountOpenDate: string;
  closingDate: string;
  rateOfInterest: number;
  planName: string;
  status: string;
  closingBalance: number;
};

export type MemberCoApplicant = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  address: string;
  linkedAccountNo: string;
  status: string;
};

export type LoginDetails = {
  username: string;
  role: string;
  status: string;
  lastLogin: string;
  passwordUpdatedAt: string;
};

export type MemberRecord = {
  id: string;
  branchId: string;
  branch: string;
  clientNo: string;
  applicationNo: string;
  annualIncomeRange: string;
  name: string;
  fatherName: string;
  motherName: string;
  occupation: string;
  memberSourceType: string;
  memberSourceName: string;
  mobileNo: string;
  email: string;
  dob: string;
  gender: string;
  membershipStatus: string;
  joinedOn: string;
  membershipFeeCollected: boolean;
  nomineeName: string;
  nomineeRelation: string;
  nomineeAddress: string;
  nomineeAadhaarNo: string;
  nomineeVoterId: string;
  nomineePanId: string;
  nomineeMobileNo: string;
  nomineeRationNo: string;
  correspondingAddress: string;
  correspondenceLatitude: string;
  correspondenceLongitude: string;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPincode: string;
  bankAccounts: MemberBankAccount[];
  documents: MemberDocument[];
  loanAccounts: LoanLink[];
  guarantorLoans: LoanLink[];
  coApplicants: MemberCoApplicant[];
  loginDetails: LoginDetails;
  kyc: {
    pan: KycEntry;
    aadhaar: KycEntry;
    dl: KycEntry;
    verificationLogs: VerificationLog[];
  };
  notes: string;
};

export type ShareholdingType = "shareholder" | "shareTransferee";

export type ShareholdingRecord = {
  id: string;
  memberId: string;
  memberName: string;
  agent: string;
  shareholderType: ShareholdingType;
  shareRange: string;
  totalShareHold: number;
  nominalVal: number;
  totalShareVal: number;
  allottedDate: string;
  transferDate: string;
};

export type PlanCategory =
  | "fd"
  | "dd"
  | "rd"
  | "mis"
  | "gold-loan"
  | "vehicle-loan"
  | "group-loan"
  | "personal-loan"
  | "property-loan";

export type PlanRecord = {
  id: string;
  category: PlanCategory;
  planCode: string;
  planName: string;
  minAmount: number;
  tenure: string;
  lockInPeriod: string;
  interestLockInPeriod: string;
  annualInterestRate: number;
  seniorCitizen: string;
};

export type AccountTransaction = {
  id: string;
  date: string;
  type: "CREDIT" | "DEBIT";
  mode: string;
  amount: number;
  narration: string;
};

export type AccountStatementLine = {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

export type InterestPayout = {
  id: string;
  date: string;
  mode: string;
  amount: number;
  note: string;
};

export type DepositLog = {
  id: string;
  date: string;
  event: string;
  actor: string;
  remark: string;
};

export type AccountRecord = {
  id: string;
  memberId: string;
  memberName: string;
  branchId: string;
  branch: string;
  agent: string;
  minor: boolean;
  planCategory: PlanCategory;
  planName: string;
  amount: number;
  openDate: string;
  autoRenew: boolean;
  jointAccount: boolean;
  accountOnHold: boolean;
  seniorCitizen: boolean;
  amountTransactionDate: string;
  paymentNote: string;
  nominee: string;
  nomineeRelation: string;
  accountNo: string;
  accountType: string;
  status: string;
  closingBalance: number;
  interestPayouts: InterestPayout[];
  transactions: AccountTransaction[];
  statement: AccountStatementLine[];
  documents: MemberDocument[];
  depositLogs: DepositLog[];
};

export const planCategoryOptions: Array<{ value: PlanCategory; label: string; codePrefix: string }> = [
  { value: "fd", label: "FD Account Plan", codePrefix: "FD" },
  { value: "dd", label: "DD Account Plan", codePrefix: "DD" },
  { value: "rd", label: "RD Accounts Plan", codePrefix: "RD" },
  { value: "mis", label: "MIS Accounts Plan", codePrefix: "MIS" },
  { value: "gold-loan", label: "Gold Loan Plan", codePrefix: "GL" },
  { value: "vehicle-loan", label: "Vehicle Loan Plan", codePrefix: "VL" },
  { value: "group-loan", label: "Group Loan Plan", codePrefix: "GR" },
  { value: "personal-loan", label: "Personal Loan Plan", codePrefix: "PL" },
  { value: "property-loan", label: "Property Loan Plan", codePrefix: "PR" }
];

function padNumber(value: number, size = 4) {
  return String(value).padStart(size, "0");
}

function extractLargestSequence(values: string[], matcher: (value: string) => number | null) {
  return values.reduce((largest, value) => {
    const next = matcher(value);
    return next && next > largest ? next : largest;
  }, 0);
}

function formatUsername(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
}

export function getNextClientNumber(members: MemberRecord[]) {
  const nextSequence = extractLargestSequence(members.map((member) => member.clientNo), (value) => {
    const match = value.match(/CL-(\d+)/i);
    return match ? Number(match[1]) : null;
  });

  return `CL-${padNumber(nextSequence + 1, 5)}`;
}

export function getNextApplicationNumber(members: MemberRecord[], referenceDate = new Date()) {
  const nextSequence = extractLargestSequence(members.map((member) => member.applicationNo), (value) => {
    const match = value.match(/APP-(\d{4})-(\d+)/i);
    return match ? Number(match[2]) : null;
  });

  return `APP-${referenceDate.getFullYear()}-${padNumber(nextSequence + 1, 4)}`;
}

export function getNextPlanCode(plans: PlanRecord[], category: PlanCategory) {
  const option = planCategoryOptions.find((entry) => entry.value === category) ?? planCategoryOptions[0];
  const nextSequence = extractLargestSequence(
    plans.filter((plan) => plan.category === category).map((plan) => plan.planCode),
    (value) => {
      const match = value.match(new RegExp(`^${option.codePrefix}-(\\d+)$`, "i"));
      return match ? Number(match[1]) : null;
    }
  );

  return `${option.codePrefix}-${padNumber(nextSequence + 1, 3)}`;
}

export function getNextAccountNumber(accounts: AccountRecord[], planCategory: PlanCategory) {
  const accountPrefix = planCategory.includes("loan") ? "LN" : "DP";
  const nextSequence = extractLargestSequence(
    accounts
      .filter((account) => account.accountNo.startsWith(accountPrefix))
      .map((account) => account.accountNo),
    (value) => {
      const match = value.match(new RegExp(`^${accountPrefix}(\\d+)$`, "i"));
      return match ? Number(match[1]) : null;
    }
  );

  return `${accountPrefix}${padNumber(nextSequence + 1, 6)}`;
}

export function normalizeBranches(branches: any[]): BranchOption[] {
  if (!branches?.length) {
    return [];
  }

  return branches.map((branch, index) => ({
    id: branch.id ?? `branch-${index + 1}`,
    name: branch.name ?? `Branch ${index + 1}`,
    code: branch.code ?? padNumber(index + 1, 5),
    city: branch.city ?? "",
    state: branch.state ?? ""
  }));
}

export function normalizeAgents(agents: any[]): AgentOption[] {
  if (!agents?.length) {
    return [];
  }

  return agents.map((agent, index) => {
    const fullName = `${agent.firstName ?? ""} ${agent.lastName ?? ""}`.trim() || `Agent ${index + 1}`;

    return {
      id: agent.id ?? `agent-${index + 1}`,
      name: fullName,
      code: agent.customerCode ?? agent.code ?? `AG${padNumber(index + 1, 3)}`
    };
  });
}

export function createEmptyMember(branches: BranchOption[], agents: AgentOption[]): MemberRecord {
  const branch = branches[0];
  const agent = agents[0];
  const today = new Date().toISOString().split("T")[0];

  return {
    id: "",
    branchId: branch?.id ?? "",
    branch: branch?.name ?? "",
    clientNo: "",
    applicationNo: "",
    annualIncomeRange: "0-3 Lakh",
    name: "",
    fatherName: "",
    motherName: "",
    occupation: "",
    memberSourceType: "Agent",
    memberSourceName: agent?.name ?? "",
    mobileNo: "",
    email: "",
    dob: "",
    gender: "Male",
    membershipStatus: "Active",
    joinedOn: today,
    membershipFeeCollected: false,
    nomineeName: "",
    nomineeRelation: "",
    nomineeAddress: "",
    nomineeAadhaarNo: "",
    nomineeVoterId: "",
    nomineePanId: "",
    nomineeMobileNo: "",
    nomineeRationNo: "",
    correspondingAddress: "",
    correspondenceLatitude: "",
    correspondenceLongitude: "",
    permanentAddress: "",
    permanentCity: branch?.city ?? "",
    permanentState: branch?.state ?? "",
    permanentPincode: "",
    bankAccounts: [
      {
        id: "bank-new-1",
        bankName: "",
        branch: branch?.name ?? "",
        accountType: "Savings",
        accountNumber: "",
        ifsc: "",
        status: "Primary"
      }
    ],
    documents: [],
    loanAccounts: [],
    guarantorLoans: [],
    coApplicants: [],
    loginDetails: {
      username: "",
      role: "CLIENT",
      status: "Invited",
      lastLogin: "Not yet logged in",
      passwordUpdatedAt: today
    },
    kyc: {
      pan: {
        number: "",
        verified: false,
        verifiedOn: "",
        remark: "",
        documentLabel: ""
      },
      aadhaar: {
        number: "",
        verified: false,
        verifiedOn: "",
        remark: "",
        documentLabel: ""
      },
      dl: {
        number: "",
        verified: false,
        verifiedOn: "",
        remark: "",
        documentLabel: ""
      },
      verificationLogs: []
    },
    notes: ""
  };
}

export function createEmptyShareholding(memberId = "", memberName = "", agent = ""): ShareholdingRecord {
  return {
    id: "",
    memberId,
    memberName,
    agent,
    shareholderType: "shareholder",
    shareRange: "",
    totalShareHold: 0,
    nominalVal: 100,
    totalShareVal: 0,
    allottedDate: new Date().toISOString().split("T")[0],
    transferDate: ""
  };
}

export function createEmptyPlan(category: PlanCategory = "fd"): PlanRecord {
  const option = planCategoryOptions.find((entry) => entry.value === category) ?? planCategoryOptions[0];

  return {
    id: "",
    category,
    planCode: `${option.codePrefix}-${padNumber(1, 3)}`,
    planName: option.label,
    minAmount: 0,
    tenure: "",
    lockInPeriod: "",
    interestLockInPeriod: "",
    annualInterestRate: 0,
    seniorCitizen: "No"
  };
}

export function createEmptyAccount(
  members: MemberRecord[],
  plans: PlanRecord[],
  branches: BranchOption[]
): AccountRecord {
  const member = members[0];
  const plan = plans[0] ?? createEmptyPlan("fd");
  const branch = branches.find((entry) => entry.id === member?.branchId) ?? branches[0];
  const today = new Date().toISOString().split("T")[0];

  return {
    id: "",
    memberId: member?.id ?? "",
    memberName: member?.name ?? "",
    branchId: branch?.id ?? member?.branchId ?? "",
    branch: branch?.name ?? member?.branch ?? "",
    agent: member?.memberSourceName ?? "",
    minor: false,
    planCategory: plan.category,
    planName: plan.planName,
    amount: 0,
    openDate: today,
    autoRenew: true,
    jointAccount: false,
    accountOnHold: false,
    seniorCitizen: false,
    amountTransactionDate: today,
    paymentNote: "",
    nominee: member?.nomineeName ?? "",
    nomineeRelation: member?.nomineeRelation ?? "",
    accountNo: "",
    accountType: plan.category.includes("loan") ? "Loan Account" : "Deposit Account",
    status: "Active",
    closingBalance: 0,
    interestPayouts: [],
    transactions: [],
    statement: [],
    documents: [],
    depositLogs: []
  };
}

export function buildLoginUsername(name: string) {
  return formatUsername(name);
}
