import { apiRequest } from "./http";

export type DepositSchemeRecord = {
  id: string;
  code: string;
  name: string;
  minMonths: number;
  maxMonths: number;
  interestRate: number | string;
  recurring: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateDepositSchemePayload = {
  code: string;
  name: string;
  minMonths: number;
  maxMonths: number;
  interestRate: number;
  recurring: boolean;
};

export type OpenDepositAccountPayload = {
  accountId: string;
  schemeId: string;
  principalAmount: number;
  durationMonths?: number;
  startDate?: string;
};

export async function listDepositSchemes(token: string) {
  return apiRequest<DepositSchemeRecord[]>(token, "GET", "/deposits/schemes");
}

export async function createDepositScheme(token: string, payload: CreateDepositSchemePayload) {
  return apiRequest<DepositSchemeRecord>(token, "POST", "/deposits/schemes", payload);
}

export async function openDepositAccount(token: string, payload: OpenDepositAccountPayload) {
  return apiRequest(token, "POST", "/deposits/open", payload);
}
