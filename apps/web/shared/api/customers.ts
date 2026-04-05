import { apiRequest } from "./http";

export type CustomerListRecord = {
  id: string;
  customerCode: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  kycVerified?: boolean;
  createdAt?: string;
  openingDate?: string;
  isDisabled?: boolean;
  _count?: {
    accounts: number;
  };
  society?: { code: string; name: string } | null;
};

export type CustomerCreatePayload = {
  societyCode?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  kycVerified?: boolean;
};

export type CustomerUpdatePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  kycVerified?: boolean;
};

export async function listCustomers(
  token: string,
  params: {
    q?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 100));

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  return apiRequest<{
    page: number;
    limit: number;
    total: number;
    rows: CustomerListRecord[];
  }>(token, "GET", `/customers?${searchParams.toString()}`);
}

export async function createCustomer(token: string, payload: CustomerCreatePayload) {
  return apiRequest<CustomerListRecord>(token, "POST", "/customers", payload);
}

export async function updateCustomer(token: string, id: string, payload: CustomerUpdatePayload) {
  return apiRequest<CustomerListRecord>(token, "PATCH", `/customers/${id}`, payload);
}

export async function getCustomerMe(token: string) {
  return apiRequest<{
    id: string;
    customerCode: string;
    firstName: string;
    lastName: string | null;
    accounts: Array<{
      id: string;
      accountNumber: string;
      type: string;
      currentBalance: number;
    }>;
    dashboardStats: {
      totalInvested: number;
      interestEarned: number;
      totalWithdrawn: number;
      netBalance: number;
    };
    allottedAgent: {
      id: string;
      customerCode: string;
      firstName: string;
      lastName: string | null;
      phone: string | null;
    } | null;
  }>(token, "GET", "/customers/me");
}
