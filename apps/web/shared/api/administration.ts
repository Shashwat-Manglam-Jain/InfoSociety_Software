import { apiRequest } from "./http";
import type { UserRole } from "../types";

export type AdministrationBranchPayload = {
  code: string;
  name: string;
  isHead?: boolean;
  contactEmail?: string;
  contactNo?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  openingDate?: string;
  lockerFacility?: boolean;
  neftImpsService?: boolean;
  isActive?: boolean;
};

export type AdministrationUserPayload = {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
  branchId?: string;
  allowedModuleSlugs?: string[];
};

export type AdministrationUserRecord = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  branchId?: string | null;
  allowedModuleSlugs?: string[];
  customerId?: string | null;
  requiresPasswordChange?: boolean;
  customerProfile?: {
    id: string;
    customerCode: string;
  } | null;
  society?: {
    code: string;
    name: string;
  } | null;
  createdAt?: string;
};

export async function adminCreateBranch(token: string, payload: AdministrationBranchPayload) {
  return apiRequest(token, "POST", "/administration/branches", payload);
}

export async function adminListBranches(token: string) {
  return apiRequest(token, "GET", "/administration/branches");
}

export async function adminUpdateBranch(token: string, id: string, payload: Partial<AdministrationBranchPayload>) {
  return apiRequest(token, "PATCH", `/administration/branches/${id}`, payload);
}

export async function adminDeleteBranch(token: string, id: string) {
  return apiRequest(token, "POST", `/administration/branches/${id}/delete`);
}

export async function adminListDirectors(token: string) {
  return apiRequest(token, "GET", "/administration/directors");
}

export async function adminCreateDirector(token: string, payload: any) {
  return apiRequest(token, "POST", "/administration/directors", payload);
}

export async function adminUpdateDirector(token: string, id: string, payload: any) {
  return apiRequest(token, "PATCH", `/administration/directors/${id}`, payload);
}

export async function adminDeleteDirector(token: string, id: string) {
  return apiRequest(token, "POST", `/administration/directors/${id}/delete`);
}

export async function listSocietyAgents(token: string) {
  return apiRequest(token, "GET", "/administration/society-agents");
}

export async function listSocietyTransactions(token: string, search: string = "") {
  const query = new URLSearchParams();
  if (search.trim()) {
    query.set("search", search.trim());
  }
  return apiRequest(token, "GET", `/administration/society-transactions${query.toString() ? `?${query.toString()}` : ""}`);
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

export async function getSocietyOverview(token: string, branchId?: string) {
  const query = branchId ? `?branchId=${branchId}` : "";
  return apiRequest(token, "GET", `/administration/society-overview${query}`);
}

export async function getCustomerDetails(token: string, id: string) {
  return apiRequest(token, "GET", `/administration/customers/${id}`);
}

export async function getAgentDetails(token: string, id: string) {
  return apiRequest(token, "GET", `/administration/agents/${id}`);
}

export async function listStaffUsers(token: string) {
  return apiRequest(token, "GET", "/administration/users");
}

export async function updateUserStatus(token: string, id: string, isActive: boolean) {
  return apiRequest(token, "PATCH", `/administration/users/${id}/status`, { isActive });
}

export async function updateUserAccess(token: string, id: string, allowedModuleSlugs: string[]) {
  return apiRequest(token, "PATCH", `/administration/users/${id}/access`, { allowedModuleSlugs });
}
