import { requestJson } from "./http";

export type UserDirectoryEntry = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  branchId?: string | null;
  allowedModuleSlugs?: string[];
  society: { code: string; name: string } | null;
  createdAt: string;
};

export async function getUserDirectory(token: string) {
  return requestJson<UserDirectoryEntry[]>({
    token,
    path: "/users/directory"
  });
}

export type UpdateProfilePayload = {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: string;
  panNumber?: string;
  nomineeFullName?: string;
  nomineeRelation?: string;
  nomineeContactNumber?: string;
};

export async function updateMyProfile(token: string, payload: UpdateProfilePayload) {
  return requestJson<Record<string, unknown>>({
    token,
    path: "/auth/me",
    method: "PATCH",
    body: payload
  });
}
