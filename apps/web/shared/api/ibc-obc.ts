import { apiRequest } from "./http";
import type { InstrumentStatus } from "./cheque-clearing";

export type { InstrumentStatus } from "./cheque-clearing";

export type IbcObcType = "IBC" | "OBC";

export type IbcObcRecord = {
  id: string;
  instrumentNumber: string;
  type: IbcObcType;
  accountId?: string | null;
  customerId?: string | null;
  amount: number | string;
  status: InstrumentStatus;
  entryDate: string;
  resolvedDate?: string | null;
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

export type IbcObcListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: IbcObcRecord[];
};

export type CreateIbcObcPayload = {
  instrumentNumber: string;
  type: IbcObcType;
  accountId?: string;
  customerId?: string;
  amount: number;
};

export async function listIbcObc(
  token: string,
  params: {
    q?: string;
    type?: IbcObcType | "";
    status?: InstrumentStatus | "";
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

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<IbcObcListResponse>(token, "GET", `/ibc-obc${query ? `?${query}` : ""}`);
}

export async function createIbcObc(token: string, payload: CreateIbcObcPayload) {
  return apiRequest<IbcObcRecord>(token, "POST", "/ibc-obc", payload);
}

export async function updateIbcObcStatus(token: string, instrumentId: string, status: InstrumentStatus) {
  return apiRequest<IbcObcRecord>(token, "PATCH", `/ibc-obc/${instrumentId}/status`, { status });
}
