import { apiRequest } from "./http";

export type InstrumentStatus = "ENTERED" | "CLEARED" | "RETURNED" | "CANCELLED";

export type ChequeClearingRecord = {
  id: string;
  chequeNumber: string;
  accountId?: string | null;
  bankName: string;
  branchName: string;
  amount: number | string;
  status: InstrumentStatus;
  entryDate: string;
  clearedDate?: string | null;
  account?: {
    id: string;
    accountNumber: string;
    societyId: string;
  } | null;
};

export type ChequeClearingListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: ChequeClearingRecord[];
};

export type CreateChequeEntryPayload = {
  chequeNumber: string;
  accountId: string;
  bankName: string;
  branchName: string;
  amount: number;
};

export async function listChequeClearing(
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
  return apiRequest<ChequeClearingListResponse>(token, "GET", `/cheque-clearing${query ? `?${query}` : ""}`);
}

export async function createChequeEntry(token: string, payload: CreateChequeEntryPayload) {
  return apiRequest<ChequeClearingRecord>(token, "POST", "/cheque-clearing", payload);
}

export async function updateChequeEntry(
  token: string,
  entryId: string,
  payload: Partial<Pick<CreateChequeEntryPayload, "bankName" | "branchName" | "amount">>
) {
  return apiRequest<ChequeClearingRecord>(token, "PATCH", `/cheque-clearing/${entryId}`, payload);
}

export async function updateChequeStatus(token: string, entryId: string, status: InstrumentStatus) {
  return apiRequest<ChequeClearingRecord>(token, "PATCH", `/cheque-clearing/${entryId}/status`, { status });
}
