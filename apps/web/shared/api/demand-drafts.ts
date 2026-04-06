import { apiRequest } from "./http";
import type { InstrumentStatus } from "./cheque-clearing";

export type { InstrumentStatus } from "./cheque-clearing";

export type DemandDraftRecord = {
  id: string;
  draftNumber: string;
  accountId?: string | null;
  customerId?: string | null;
  beneficiary: string;
  amount: number | string;
  status: InstrumentStatus;
  issuedAt: string;
  clearedAt?: string | null;
  account?: {
    accountNumber: string;
    societyId: string;
  } | null;
  customer?: {
    customerCode: string;
    firstName: string;
    lastName?: string | null;
    societyId: string;
  } | null;
};

export type DemandDraftListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: DemandDraftRecord[];
};

export type CreateDemandDraftPayload = {
  accountId?: string;
  customerId?: string;
  beneficiary: string;
  amount: number;
};

export type UpdateDemandDraftPayload = {
  beneficiary?: string;
  amount?: number;
};

export async function listDemandDrafts(
  token: string,
  params: {
    q?: string;
    status?: InstrumentStatus | "";
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

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<DemandDraftListResponse>(token, "GET", `/demand-drafts${query ? `?${query}` : ""}`);
}

export async function createDemandDraft(token: string, payload: CreateDemandDraftPayload) {
  return apiRequest<DemandDraftRecord>(token, "POST", "/demand-drafts", payload);
}

export async function updateDemandDraft(token: string, draftId: string, payload: UpdateDemandDraftPayload) {
  return apiRequest<DemandDraftRecord>(token, "PATCH", `/demand-drafts/${draftId}`, payload);
}

export async function updateDemandDraftStatus(token: string, draftId: string, status: InstrumentStatus) {
  return apiRequest<DemandDraftRecord>(token, "PATCH", `/demand-drafts/${draftId}/status`, { status });
}
