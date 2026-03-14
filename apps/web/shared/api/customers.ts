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

