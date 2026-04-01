import { apiRequest } from "./http";

export async function listCustomers(token: string, q?: string) {
  const params = new URLSearchParams({
    page: "1",
    limit: "50"
  });

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  return apiRequest<{
    page: number;
    limit: number;
    total: number;
    rows: Array<{
      id: string;
      customerCode: string;
      firstName: string;
      lastName?: string | null;
      society?: { code: string; name: string } | null;
    }>;
  }>(token, "GET", `/customers?${params.toString()}`);
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
