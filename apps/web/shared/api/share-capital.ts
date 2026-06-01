import { apiRequest } from "./http";

export type ShareRecord = {
  id: string;
  societyId: string;
  customerId: string;
  certificateNo: string;
  sharesHeld: number;
  faceValue: number | string;
  paidUpValue: number | string;
  purchaseDate: string;
  surrenderDate?: string | null;
  status: "ACTIVE" | "SURRENDERED" | "FORFEITED";
  customer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    customerCode?: string;
  };
  createdAt?: string;
};

export type ShareListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: ShareRecord[];
};

export type CreateSharePayload = {
  customerId: string;
  certificateNo: string;
  sharesHeld: number;
  faceValue: number;
  paidUpValue: number;
  purchaseDate: string;
};

export type UpdateSharePayload = Partial<CreateSharePayload>;

export async function listShares(
  token: string,
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

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
  return apiRequest<ShareListResponse>(token, "GET", `/banking/share-capital${query ? `?${query}` : ""}`);
}

export async function createShare(token: string, payload: CreateSharePayload) {
  return apiRequest<ShareRecord>(token, "POST", "/banking/share-capital", payload);
}

export async function updateShare(token: string, id: string, payload: UpdateSharePayload) {
  return apiRequest<ShareRecord>(token, "PATCH", `/banking/share-capital/${id}`, payload);
}

export async function surrenderShare(token: string, id: string) {
  return apiRequest<ShareRecord>(token, "POST", `/banking/share-capital/${id}/surrender`, {});
}

export async function forfeitShare(token: string, id: string) {
  return apiRequest<ShareRecord>(token, "POST", `/banking/share-capital/${id}/forfeit`, {});
}
