import type { AuthUser, LoginResponse, Society } from "../types";
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
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/auth/login",
    body: { username, password }
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

