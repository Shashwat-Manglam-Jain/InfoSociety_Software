import { apiRequest } from "./http";

export type InvestmentRecord = {
  id: string;
  bankName: string;
  investmentType: string;
  amount: number | string;
  interestRate: number | string;
  startDate: string;
  maturityDate: string;
  maturityAmount: number | string;
  withdrawnDate?: string | null;
  createdAt?: string;
};

export type InvestmentListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: InvestmentRecord[];
};

export type CreateInvestmentPayload = {
  bankName: string;
  investmentType: string;
  amount: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  maturityAmount?: number;
};

export type RenewInvestmentPayload = {
  startDate?: string;
  maturityDate: string;
  amount?: number;
  interestRate?: number;
};

export type WithdrawInvestmentPayload = {
  withdrawnDate?: string;
  maturityAmount?: number;
};

export async function listInvestments(
  token: string,
  params: {
    q?: string;
    maturityBefore?: string;
    activeOnly?: "true" | "false" | "";
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.maturityBefore) {
    searchParams.set("maturityBefore", params.maturityBefore);
  }

  if (params.activeOnly) {
    searchParams.set("activeOnly", params.activeOnly);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<InvestmentListResponse>(token, "GET", `/investments${query ? `?${query}` : ""}`);
}

export async function createInvestment(token: string, payload: CreateInvestmentPayload) {
  return apiRequest<InvestmentRecord>(token, "POST", "/investments", payload);
}

export async function renewInvestment(token: string, investmentId: string, payload: RenewInvestmentPayload) {
  return apiRequest<InvestmentRecord>(token, "POST", `/investments/${investmentId}/renew`, payload);
}

export async function withdrawInvestment(token: string, investmentId: string, payload: WithdrawInvestmentPayload = {}) {
  return apiRequest<InvestmentRecord>(token, "POST", `/investments/${investmentId}/withdraw`, payload);
}
