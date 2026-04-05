import { apiRequest } from "./http";

export type TransactionType = "DEBIT" | "CREDIT";
export type TransactionMode = "CASH" | "CHEQUE" | "TRANSFER" | "ADJUSTMENT";

export type TransactionRecord = {
  id: string;
  transactionNumber: string;
  accountId: string;
  valueDate: string;
  amount: number | string;
  type: TransactionType;
  mode: TransactionMode;
  remark?: string | null;
  isPassed: boolean;
  passedAt?: string | null;
  createdAt: string;
  account: {
    id: string;
    accountNumber: string;
    societyId: string;
    customerId: string;
  };
  createdBy?: {
    username: string;
    fullName: string;
  } | null;
};

export type TransactionListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: TransactionRecord[];
};

export type CreateTransactionPayload = {
  accountId: string;
  amount: number;
  type: TransactionType;
  mode: TransactionMode;
  remark?: string;
  valueDate?: string;
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export async function listTransactions(
  token: string,
  params: {
    q?: string;
    accountId?: string;
    isPassed?: "" | "true" | "false";
    type?: TransactionType | "";
    mode?: TransactionMode | "";
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.accountId) {
    searchParams.set("accountId", params.accountId);
  }

  if (params.isPassed) {
    searchParams.set("isPassed", params.isPassed);
  }

  if (params.type) {
    searchParams.set("type", params.type);
  }

  if (params.mode) {
    searchParams.set("mode", params.mode);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<TransactionListResponse>(token, "GET", `/transactions${query ? `?${query}` : ""}`);
}

export async function createTransaction(token: string, payload: CreateTransactionPayload) {
  return apiRequest<TransactionRecord>(token, "POST", "/transactions", payload);
}

export async function updateTransaction(token: string, transactionId: string, payload: UpdateTransactionPayload) {
  return apiRequest<TransactionRecord>(token, "PATCH", `/transactions/${transactionId}`, payload);
}

export async function passTransaction(token: string, transactionId: string) {
  return apiRequest<TransactionRecord>(token, "POST", `/transactions/${transactionId}/pass`);
}

export async function cancelTransaction(token: string, transactionId: string, reason?: string) {
  return apiRequest<
    | { cancelledTransactionId: string; reversalTransactionId: string; reversalTransactionNumber: string }
    | { id: string }
  >(token, "POST", `/transactions/${transactionId}/cancel`, reason ? { reason } : {});
}
