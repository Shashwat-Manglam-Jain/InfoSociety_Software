import { apiRequest } from "./http";

export type FinancialYearRecord = {
  id: string;
  societyId: string;
  label: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string | null;
  createdAt?: string;
};

export type FinancialYearListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: FinancialYearRecord[];
};

export type CreateFinancialYearPayload = {
  label: string;
  startDate: string;
  endDate: string;
};

export async function listFinancialYears(token: string) {
  return apiRequest<FinancialYearListResponse>(token, "GET", "/banking/financial-years");
}

export async function createFinancialYear(token: string, payload: CreateFinancialYearPayload) {
  return apiRequest<FinancialYearRecord>(token, "POST", "/banking/financial-years", payload);
}

export async function closeFinancialYear(token: string, id: string) {
  return apiRequest<FinancialYearRecord>(token, "POST", `/banking/financial-years/${id}/close`, {});
}

export async function getFinancialYear(token: string, id: string) {
  return apiRequest<FinancialYearRecord>(token, "GET", `/banking/financial-years/${id}`);
}
