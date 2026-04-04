import type { AuthUser, LoginResponse, Society, UserRole } from "../types";
import { apiRequest, requestJson } from "./http";

export type RegisterClientPayload = {
  username: string;
  password: string;
  fullName: string;
  societyCode: string;
  phone?: string;
  address?: string;
};

export type RegisterAgentPayload = {
  username: string;
  password: string;
  fullName: string;
  societyCode: string;
};

export type RegisterSocietyPayload = {
  username: string;
  password: string;
  fullName: string;
  societyCode: string;
  societyName: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  acceptsDigitalPayments?: boolean;
  upiId?: string;
  panNo?: string;
  tanNo?: string;
  gstNo?: string;
  category?: string;
  authorizedCapital?: number;
  paidUpCapital?: number;
  shareNominalValue?: number;
  registrationDate?: string;
  registrationNumber?: string;
  registrationState?: string;
  registrationAuthority?: string;
};

export async function login(
  username: string,
  password: string,
  societyCode?: string,
  expectedRole?: UserRole
): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/auth/login",
    body: { username, password, societyCode, expectedRole }
  });
}

export async function registerClient(payload: RegisterClientPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/auth/register/client",
    body: payload
  });
}

export async function registerAgentSelf(payload: RegisterAgentPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/auth/register/agent/self",
    body: payload
  });
}

export async function registerSociety(payload: RegisterSocietyPayload): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/auth/register/society",
    body: payload
  });
}

export async function registerAgent(token: string, payload: RegisterAgentPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>(token, "POST", "/auth/register/agent", payload);
}

export async function getPublicSocieties(): Promise<Society[]> {
  return requestJson<Society[]>({
    path: "/auth/societies"
  });
}

export async function getMe(token: string): Promise<AuthUser> {
  return requestJson<AuthUser>({
    token,
    path: "/auth/me"
  });
}

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>({
    token,
    method: "POST",
    path: "/auth/change-password",
    body: { currentPassword, newPassword }
  });
}
