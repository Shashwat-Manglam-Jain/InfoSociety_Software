import { apiRequest } from "./http";

export type CashbookEntryRecord = {
  id: string;
  headCode: string;
  headName: string;
  amount: number | string;
  type: "DEBIT" | "CREDIT";
  mode: string;
  remark?: string | null;
  entryDate: string;
  isPosted: boolean;
  postedAt?: string | null;
  createdAt: string;
};

export type CashbookEntryListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: CashbookEntryRecord[];
};

export type LedgerSummaryResponse = {
  date: string | null;
  heads: Record<string, { headName: string; debit: number; credit: number }>;
};

function buildQuery(params: {
  q?: string;
  date?: string;
  isPosted?: "" | "true" | "false";
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.date) {
    searchParams.set("date", params.date);
  }

  if (params.isPosted) {
    searchParams.set("isPosted", params.isPosted);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listCashbookEntries(
  token: string,
  params: {
    q?: string;
    date?: string;
    isPosted?: "" | "true" | "false";
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<CashbookEntryListResponse>(token, "GET", `/cashbook${buildQuery(params)}`);
}

export async function recomputeGeneralLedger(token: string, date?: string) {
  return apiRequest<LedgerSummaryResponse>(
    token,
    "POST",
    "/administration/recompute/gl",
    date ? { date } : {}
  );
}
