import { apiRequest } from "./http";

export type HeadRecord = {
  id: string;
  code: string;
  name: string;
  group: string;
  relatedType: string;
  accountCode: string;
};

export async function listHeads(token: string, relatedType?: string) {
  const query = relatedType?.trim() ? `?relatedType=${encodeURIComponent(relatedType.trim())}` : "";
  return apiRequest<HeadRecord[]>(token, "GET", `/banking/heads${query}`);
}
