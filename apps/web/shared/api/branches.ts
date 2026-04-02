import type { Branch } from "../types";
import { apiRequest } from "./http";

export type UpsertBranchPayload = {
  societyId?: string;
  code: string;
  name: string;
  isHead?: boolean;
  openingDate?: string;
  contactEmail?: string;
  contactNo?: string;
  rechargeService?: boolean;
  neftImpsService?: boolean;
  ifscCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  lockerFacility?: boolean;
  isActive?: boolean;
};

export async function listBranches(token: string) {
  return apiRequest<Branch[]>(token, "GET", "/banking/branches");
}

export async function createBranch(token: string, payload: UpsertBranchPayload) {
  return apiRequest<Branch>(token, "POST", "/banking/branches", payload);
}

export async function updateBranch(token: string, branchId: string, payload: UpsertBranchPayload) {
  return apiRequest<Branch>(token, "PATCH", `/banking/branches/${branchId}`, payload);
}
