import { apiRequest } from "./http";

export type StandingInstructionRecord = {
  id: string;
  societyId: string;
  sourceAccountId: string;
  sourceAccountNumber?: string;
  targetAccountId: string;
  targetAccountNumber?: string;
  amount: number | string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  nextExecutionDate: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "DEACTIVATED";
  createdAt?: string;
};

export type StandingInstructionListResponse = {
  page: number;
  limit: number;
  total: number;
  rows: StandingInstructionRecord[];
};

export type CreateStandingInstructionPayload = {
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  frequency: StandingInstructionRecord["frequency"];
  nextExecutionDate: string;
};

export type UpdateStandingInstructionPayload = Partial<CreateStandingInstructionPayload>;

export async function listStandingInstructions(
  token: string,
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();
  return apiRequest<StandingInstructionListResponse>(token, "GET", `/banking/standing-instructions${query ? `?${query}` : ""}`);
}

export async function createStandingInstruction(token: string, payload: CreateStandingInstructionPayload) {
  return apiRequest<StandingInstructionRecord>(token, "POST", "/banking/standing-instructions", payload);
}

export async function updateStandingInstruction(token: string, id: string, payload: UpdateStandingInstructionPayload) {
  return apiRequest<StandingInstructionRecord>(token, "PATCH", `/banking/standing-instructions/${id}`, payload);
}

export async function deactivateStandingInstruction(token: string, id: string) {
  return apiRequest<StandingInstructionRecord>(token, "POST", `/banking/standing-instructions/${id}/deactivate`, {});
}
