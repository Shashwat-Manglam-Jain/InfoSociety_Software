import { apiRequest } from "./http";

export type DividendDeclarationRecord = {
  id: string;
  societyId: string;
  financialYearId: string;
  financialYearLabel?: string;
  ratePercent: number | string;
  totalAmount: number | string;
  status: "DECLARED" | "APPROVED" | "PAID" | "CANCELLED";
  declaredAt?: string;
  approvedAt?: string | null;
  processedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
};

export type DividendPayoutRecord = {
  id: string;
  dividendId: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  sharesHeld: number;
  payoutAmount: number | string;
  paidAt?: string | null;
  status: string;
};

export type DividendListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: DividendDeclarationRecord[];
};

export type DeclareDividendPayload = {
  financialYearId: string;
  ratePercent: number;
};

export async function listDividends(token: string) {
  return apiRequest<DividendListResponse>(token, "GET", "/banking/dividends");
}

export async function declareDividend(token: string, payload: DeclareDividendPayload) {
  return apiRequest<DividendDeclarationRecord>(token, "POST", "/banking/dividends", payload);
}

export async function approveDividend(token: string, id: string) {
  return apiRequest<DividendDeclarationRecord>(token, "POST", `/banking/dividends/${id}/approve`, {});
}

export async function processDividendPayouts(token: string, id: string) {
  return apiRequest<DividendDeclarationRecord>(token, "POST", `/banking/dividends/${id}/process`, {});
}

export async function listDividendPayouts(token: string, id: string) {
  return apiRequest<DividendPayoutRecord[]>(token, "GET", `/banking/dividends/${id}/payouts`);
}

export async function cancelDividend(token: string, id: string) {
  return apiRequest<DividendDeclarationRecord>(token, "POST", `/banking/dividends/${id}/cancel`, {});
}
