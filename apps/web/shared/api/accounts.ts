import { apiRequest } from "./http";

export type AccountType =
  | "SAVINGS"
  | "CURRENT"
  | "FIXED_DEPOSIT"
  | "RECURRING_DEPOSIT"
  | "LOAN"
  | "PIGMY"
  | "GENERAL";

export type AccountStatus = "PENDING" | "ACTIVE" | "FROZEN" | "DORMANT" | "CLOSED";

export type AccountRecord = {
  id: string;
  accountNumber: string;
  societyId: string;
  customerId: string;
  type: AccountType;
  status: AccountStatus;
  currentBalance: number | string;
  interestRate?: number | string | null;
  branchCode?: string | null;
  branchId?: string | null;
  isPassbookEnabled?: boolean;
  createdAt?: string;
  customer?: {
    id: string;
    customerCode: string;
    firstName: string;
    lastName?: string | null;
  } | null;
  depositAccount?: {
    id: string;
    maturityDate?: string | null;
    maturityAmount?: number | string | null;
  } | null;
  loanAccount?: {
    id: string;
    status: string;
    sanctionedAmount?: number | string | null;
    overdueAmount?: number | string | null;
  } | null;
};

export type AccountListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: AccountRecord[];
};

export type CreateAccountPayload = {
  customerId: string;
  type: AccountType;
  accountNumber?: string;
  openingBalance?: number;
  interestRate?: number;
  branchCode?: string;
  branchId?: string;
  headId: string;
  isPassbookEnabled?: boolean;
};

export async function listAccounts(
  token: string,
  params: {
    q?: string;
    type?: AccountType | "";
    status?: AccountStatus | "";
    customerId?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.type) {
    searchParams.set("type", params.type);
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
  return apiRequest<AccountListResponse>(token, "GET", `/accounts${query ? `?${query}` : ""}`);
}

export async function createAccount(token: string, payload: CreateAccountPayload) {
  return apiRequest<AccountRecord>(token, "POST", "/accounts", payload);
}
