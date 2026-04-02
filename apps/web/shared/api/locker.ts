import { apiRequest } from "./http";

export type LockerSize = "SMALL" | "MEDIUM" | "LARGE";
export type LockerStatus = "ACTIVE" | "EXPIRED" | "CLOSED";

export type LockerVisitRecord = {
  id: string;
  lockerId: string;
  visitedAt: string;
  remarks?: string | null;
};

export type LockerRecord = {
  id: string;
  lockerNumber: string;
  customerId: string;
  size: LockerSize;
  status: LockerStatus;
  openingDate: string;
  closingDate?: string | null;
  annualCharge: number | string;
  customer: {
    customerCode: string;
    firstName: string;
    lastName?: string | null;
    societyId: string;
  };
  _count?: {
    visits: number;
  };
};

export type LockerListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: LockerRecord[];
};

export type CreateLockerPayload = {
  customerId: string;
  lockerNumber: string;
  size: LockerSize;
  annualCharge: number;
};

function buildLockerQuery(params: {
  q?: string;
  status?: LockerStatus | "";
  page?: number;
  limit?: number;
}) {
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
  return query ? `?${query}` : "";
}

export async function listLockers(
  token: string,
  params: {
    q?: string;
    status?: LockerStatus | "";
    page?: number;
    limit?: number;
  } = {}
) {
  return apiRequest<LockerListResponse>(token, "GET", `/locker${buildLockerQuery(params)}`);
}

export async function createLocker(token: string, payload: CreateLockerPayload) {
  return apiRequest<LockerRecord>(token, "POST", "/locker", payload);
}

export async function closeLocker(token: string, lockerId: string, reason?: string) {
  return apiRequest<LockerRecord>(token, "POST", `/locker/${lockerId}/close`, reason ? { reason } : {});
}

export async function visitLocker(token: string, lockerId: string, remarks?: string) {
  return apiRequest<LockerVisitRecord>(token, "POST", `/locker/${lockerId}/visit`, remarks ? { remarks } : {});
}

export async function listLockerVisits(token: string, lockerId: string) {
  return apiRequest<LockerVisitRecord[]>(token, "GET", `/locker/${lockerId}/visits`);
}
