import { apiRequest } from "./http";

export type LoanNoticeRecord = {
  id: string;
  societyId: string;
  loanId: string;
  customerId: string;
  customerName?: string;
  customerCode?: string;
  noticeType: "REMINDER" | "DEMAND" | "OVERDUE" | "LEGAL";
  issuedDate: string;
  dueDate: string;
  deliveredAt?: string | null;
  remarks?: string | null;
  createdAt?: string;
};

export type LoanNoticeListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: LoanNoticeRecord[];
};

export type CreateLoanNoticePayload = {
  loanId: string;
  customerId: string;
  noticeType: LoanNoticeRecord["noticeType"];
  issuedDate: string;
  dueDate: string;
  remarks?: string;
};

export async function listLoanNotices(
  token: string,
  params: {
    noticeType?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.noticeType) {
    searchParams.set("noticeType", params.noticeType);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<LoanNoticeListResponse>(token, "GET", `/banking/loan-notices${query ? `?${query}` : ""}`);
}

export async function createLoanNotice(token: string, payload: CreateLoanNoticePayload) {
  return apiRequest<LoanNoticeRecord>(token, "POST", "/banking/loan-notices", payload);
}

export async function deliverLoanNotice(token: string, id: string) {
  return apiRequest<LoanNoticeRecord>(token, "POST", `/banking/loan-notices/${id}/deliver`, {});
}
