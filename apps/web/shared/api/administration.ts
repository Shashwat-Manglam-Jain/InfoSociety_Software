import { apiRequest } from "./http";
import type { Branch, Society, UserRole } from "../types";

export type AdministrationBranchPayload = {
  code?: string;
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
  phone?: string;
  email?: string;
  address?: string;
};

export type AdministrationUserUpdatePayload = {
  username?: string;
  fullName?: string;
  password?: string;
  isActive?: boolean;
  branchId?: string;
  allowedModuleSlugs?: string[];
  phone?: string;
  email?: string;
  address?: string;
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
    firstName: string;
    lastName?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  society?: {
    code: string;
    name: string;
  } | null;
  createdAt?: string;
};



export type SocietyTransactionRecord = {
  id: string;
  transactionNumber: string;
  valueDate: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  mode: string;
  remark?: string | null;
  isPassed: boolean;
  createdAt: string;
  account: {
    id: string;
    accountNumber: string;
    branchId?: string | null;
    branchCode?: string | null;
    customer?: {
      firstName: string;
      lastName?: string | null;
      customerCode: string;
    } | null;
  };
  createdBy: {
    id: string;
    username: string;
    fullName: string;
  };
};

export type AgentPerformanceRecord = {
  id: string;
  name: string;
  code: string;
  daily: number;
  weekly: number;
  monthly: number;
};

export type AdministrationAgentDetails = {
  id: string;
  customerCode: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isDisabled?: boolean;
  user?: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    branchId?: string | null;
    allowedModuleSlugs?: string[];
  } | null;
  pigmyClients?: Array<{
    id: string;
    customer: {
      id: string;
      customerCode: string;
      firstName: string;
      lastName?: string | null;
      phone?: string | null;
      email?: string | null;
    };
  }>;
  performance?: {
    daily: number;
    monthly: number;
  };
};

export async function adminCreateBranch(token: string, payload: AdministrationBranchPayload) {
  return apiRequest<Branch>(token, "POST", "/administration/branches", payload);
}

export async function adminListBranches(token: string) {
  return apiRequest<Branch[]>(token, "GET", "/administration/branches");
}

export async function adminUpdateBranch(token: string, id: string, payload: Partial<AdministrationBranchPayload>) {
  return apiRequest<Branch>(token, "PATCH", `/administration/branches/${id}`, payload);
}

export async function adminDeleteBranch(token: string, id: string) {
  return apiRequest<Branch>(token, "POST", `/administration/branches/${id}/delete`);
}



export async function listSocietyAgents(token: string) {
  return apiRequest(token, "GET", "/administration/society-agents");
}

export async function listSocietyTransactions(token: string, search: string = "") {
  const query = new URLSearchParams();
  if (search.trim()) {
    query.set("search", search.trim());
  }
  return apiRequest<SocietyTransactionRecord[]>(
    token,
    "GET",
    `/administration/society-transactions${query.toString() ? `?${query.toString()}` : ""}`
  );
}

export async function getAgentPerformance(token: string) {
  return apiRequest<AgentPerformanceRecord[]>(token, "GET", "/administration/agent-performance");
}

export async function updateSociety(token: string, payload: any) {
  return apiRequest<Partial<Society>>(token, "PATCH", "/administration/society", payload);
}

export async function createStaffUser(token: string, payload: AdministrationUserPayload) {
  return apiRequest(token, "POST", "/administration/users", payload);
}

export async function updateStaffUser(token: string, id: string, payload: AdministrationUserUpdatePayload) {
  return apiRequest(token, "PATCH", `/administration/users/${id}`, payload);
}

export async function deleteStaffUser(token: string, id: string) {
  return apiRequest(token, "POST", `/administration/users/${id}/delete`);
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
  return apiRequest<AdministrationAgentDetails>(token, "GET", `/administration/agents/${id}`);
}

export async function listStaffUsers(token: string) {
  return apiRequest<AdministrationUserRecord[]>(token, "GET", "/administration/users");
}

export async function updateUserStatus(token: string, id: string, isActive: boolean) {
  return apiRequest(token, "PATCH", `/administration/users/${id}/status`, { isActive });
}

export async function updateUserAccess(token: string, id: string, allowedModuleSlugs: string[]) {
  return apiRequest(token, "PATCH", `/administration/users/${id}/access`, { allowedModuleSlugs });
}
