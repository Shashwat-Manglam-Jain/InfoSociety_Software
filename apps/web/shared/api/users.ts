import { requestJson } from "./http";

export async function getUserDirectory(token: string) {
  return requestJson<
    {
      id: string;
      username: string;
      fullName: string;
      role: string;
      isActive: boolean;
      society: { code: string; name: string } | null;
      createdAt: string;
    }[]
  >({
    token,
    path: "/users/directory"
  });
}

