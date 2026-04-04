import type { MonitoringOverview, SocietyStatus } from "../types";
import { apiRequest } from "./http";

export type UpdateSocietyAccessPayload = {
  status?: SocietyStatus;
  isActive?: boolean;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddress?: string | null;
  acceptsDigitalPayments?: boolean;
  upiId?: string | null;
  panNo?: string | null;
  tanNo?: string | null;
  gstNo?: string | null;
  category?: string | null;
  authorizedCapital?: number | null;
  paidUpCapital?: number | null;
  shareNominalValue?: number | null;
  registrationDate?: string | null;
  registrationNumber?: string | null;
  registrationState?: string | null;
  registrationAuthority?: string | null;
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
      provisionedSuperAdmin?: {
        username: string;
        fullName: string;
        role: "SUPER_USER";
        requiresPasswordChange: boolean;
        temporaryPassword: string;
        loginSocietyCode: string;
      } | null;
    }
  >(token, "PATCH", `/monitoring/societies/${societyId}/access`, payload);
}
