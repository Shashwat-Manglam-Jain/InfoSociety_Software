import type { MonitoringOverview, SocietyStatus } from "../types";
import { apiRequest } from "./http";

export type UpdateSocietyAccessPayload = {
  status?: SocietyStatus;
  isActive?: boolean;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  acceptsDigitalPayments?: boolean;
  upiId?: string;
};

export async function getMonitoringOverview(token: string): Promise<MonitoringOverview> {
  return apiRequest<MonitoringOverview>(token, "GET", "/monitoring/overview");
}

export async function updateSocietyAccess(token: string, societyId: string, payload: UpdateSocietyAccessPayload) {
  return apiRequest<
    {
      id: string;
      code: string;
      name: string;
      status: SocietyStatus;
      isActive: boolean;
      acceptsDigitalPayments: boolean;
      upiId?: string | null;
    }
  >(token, "PATCH", `/monitoring/societies/${societyId}/access`, payload);
}

