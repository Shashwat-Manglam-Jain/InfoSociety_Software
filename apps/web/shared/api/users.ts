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
