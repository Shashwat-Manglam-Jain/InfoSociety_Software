import { apiRequest } from "./http";

export type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "CLOSED" | "OVERDUE";

export type LoanPartyRecord = {
  id: string;
  customerCode: string;
  firstName: string;
  lastName?: string | null;
};

export type LoanRecord = {
  id: string;
  accountId: string;
  customerId: string;
  applicationAmount: number | string;
  sanctionedAmount?: number | string | null;
  disbursedAmount?: number | string | null;
  sanctionDate?: string | null;
  expiryDate?: string | null;
  interestRate: number | string;
  overdueAmount: number | string;
  status: LoanStatus;
  remarks?: string | null;
  createdAt: string;
  account: {
    id: string;
    accountNumber: string;
    currentBalance?: number | string;
  };
  customer: LoanPartyRecord;
  guarantor1?: LoanPartyRecord | null;
  guarantor2?: LoanPartyRecord | null;
  guarantor3?: LoanPartyRecord | null;
};

export type LoanListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: LoanRecord[];
};

export type ApplyLoanPayload = {
  customerId: string;
  accountId?: string;
  applicationAmount: number;
  interestRate: number;
  expiryDate?: string;
  guarantor1Id?: string;
  guarantor2Id?: string;
  guarantor3Id?: string;
  remarks?: string;
};

export type UpdateLoanGuarantorsPayload = {
  guarantor1Id?: string | null;
  guarantor2Id?: string | null;
  guarantor3Id?: string | null;
  remarks?: string | null;
};

export async function listLoans(
  token: string,
  params: {
    q?: string;
    status?: LoanStatus | "";
    customerId?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.customerId) {
    searchParams.set("customerId", params.customerId);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<LoanListResponse>(token, "GET", `/loans${query ? `?${query}` : ""}`);
}

export async function applyLoan(token: string, payload: ApplyLoanPayload) {
  return apiRequest<LoanRecord>(token, "POST", "/loans/apply", payload);
}

export async function sanctionLoan(
  token: string,
  loanId: string,
  payload: { sanctionedAmount: number; sanctionDate?: string; expiryDate?: string }
) {
  return apiRequest<LoanRecord>(token, "POST", `/loans/${loanId}/sanction`, payload);
}

export async function disburseLoan(token: string, loanId: string, amount: number) {
  return apiRequest<LoanRecord>(token, "POST", `/loans/${loanId}/disburse`, { amount });
}

export async function recoverLoan(token: string, loanId: string, amount: number) {
  return apiRequest<LoanRecord>(token, "POST", `/loans/${loanId}/recover`, { amount });
}

export async function updateLoanOverdue(token: string, loanId: string, overdueAmount: number) {
  return apiRequest<LoanRecord>(token, "PATCH", `/loans/${loanId}/overdue`, { overdueAmount });
}

export async function updateLoanGuarantors(token: string, loanId: string, payload: UpdateLoanGuarantorsPayload) {
  return apiRequest<LoanRecord>(token, "PATCH", `/loans/${loanId}/guarantors`, payload);
}
