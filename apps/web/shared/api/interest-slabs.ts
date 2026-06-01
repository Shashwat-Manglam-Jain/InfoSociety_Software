import { apiRequest } from "./http";

export type InterestSlabRecord = {
  id: string;
  societyId: string;
  category: string;
  minAmount: number | string;
  maxAmount: number | string;
  minDays: number;
  maxDays: number;
  ratePercent: number | string;
  isActive: boolean;
  createdAt?: string;
};

export type InterestSlabListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: InterestSlabRecord[];
};

export type CreateInterestSlabPayload = {
  category: string;
  minAmount: number;
  maxAmount: number;
  minDays: number;
  maxDays: number;
  ratePercent: number;
};

export type UpdateInterestSlabPayload = Partial<CreateInterestSlabPayload>;

export async function listInterestSlabs(
  token: string,
  params: {
    category?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<InterestSlabListResponse>(token, "GET", `/banking/interest-slabs${query ? `?${query}` : ""}`);
}

export async function createInterestSlab(token: string, payload: CreateInterestSlabPayload) {
  return apiRequest<InterestSlabRecord>(token, "POST", "/banking/interest-slabs", payload);
}

export async function updateInterestSlab(token: string, id: string, payload: UpdateInterestSlabPayload) {
  return apiRequest<InterestSlabRecord>(token, "PATCH", `/banking/interest-slabs/${id}`, payload);
}

export async function deleteInterestSlab(token: string, id: string) {
  return apiRequest<void>(token, "DELETE", `/banking/interest-slabs/${id}`);
}
