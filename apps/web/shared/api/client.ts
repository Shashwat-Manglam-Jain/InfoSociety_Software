import type { AuthUser, LoginResponse, MonitoringOverview } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: string | string[] }).message)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
}

export async function apiRequest<T = unknown>(
  token: string,
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === "GET" || method === "DELETE" ? {} : { "Content-Type": "application/json" })
    },
    cache: "no-store",
    ...(method === "GET" || method === "DELETE" ? {} : { body: JSON.stringify(body ?? {}) })
  });

  return parseResponse<T>(response);
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  return parseResponse<LoginResponse>(response);
}

export async function getMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  return parseResponse<AuthUser>(response);
}

export async function getMonitoringOverview(token: string): Promise<MonitoringOverview> {
  const response = await fetch(`${API_BASE}/monitoring/overview`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  return parseResponse<MonitoringOverview>(response);
}

export async function getUserDirectory(token: string) {
  const response = await fetch(`${API_BASE}/users/directory`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  return parseResponse<
    {
      id: string;
      username: string;
      fullName: string;
      role: string;
      isActive: boolean;
      society: { code: string; name: string } | null;
      createdAt: string;
    }[]
  >(response);
}
