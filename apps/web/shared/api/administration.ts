import { apiRequest } from "./http";
import type { UserRole } from "../types";

export type AdministrationBranchPayload = {
  code: string;
  name: string;
  isHead?: boolean;
  contactEmail?: string;
  contactNo?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export type AdministrationUserPayload = {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
  branchId?: string;
};

export async function adminCreateBranch(token: string, payload: AdministrationBranchPayload) {
  return apiRequest(token, "POST", "/administration/branches", payload);
}

export async function adminListBranches(token: string) {
  return apiRequest(token, "GET", "/administration/branches");
}

export async function listSocietyAgents(token: string) {
  return apiRequest(token, "GET", "/administration/society-agents");
}

export async function listSocietyTransactions(token: string, search: string = "") {
  return apiRequest(token, "GET", `/administration/society-transactions?search=${search}`);
}

export async function getAgentPerformance(token: string) {
  return apiRequest(token, "GET", "/administration/agent-performance");
}

export async function updateSociety(token: string, payload: any) {
  return apiRequest(token, "PATCH", "/administration/society", payload);
}

export async function createStaffUser(token: string, payload: AdministrationUserPayload) {
  return apiRequest(token, "POST", "/administration/users", payload);
}

export async function mapAgentClient(token: string, payload: { agentId: string; customerId: string }) {
  return apiRequest(token, "POST", "/administration/agent-clients", payload);
}

export async function listAgentMappings(token: string) {
  return apiRequest(token, "GET", "/administration/agent-clients");
}

export async function getAdministrationOverview(token: string) {
  return apiRequest(token, "GET", "/administration/overview");
}

export async function getAgentOverview(token: string) {
  return apiRequest(token, "GET", "/administration/agent-overview");
}

export async function getSocietyOverview(token: string) {
  return apiRequest(token, "GET", "/administration/society-overview");
}
