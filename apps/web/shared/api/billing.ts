import type { AuthSubscription, BillingPlansResponse, PaymentMethod } from "../types";
import { apiRequest, requestJson } from "./http";

export type UpgradeSubscriptionPayload = {
  paymentMethod?: PaymentMethod;
  note?: string;
};

export async function getBillingPlans(): Promise<BillingPlansResponse> {
  return requestJson<BillingPlansResponse>({
    path: "/billing/plans"
  });
}

export async function getMySubscription(token: string): Promise<AuthSubscription> {
  return apiRequest<AuthSubscription>(token, "GET", "/billing/me");
}

export async function upgradeToPremium(token: string, payload: UpgradeSubscriptionPayload = {}) {
  return apiRequest<{ message: string; subscription: AuthSubscription }>(token, "POST", "/billing/upgrade", payload);
}

export async function cancelPremium(token: string) {
  return apiRequest<{ message: string; subscription: AuthSubscription }>(token, "POST", "/billing/cancel", {});
}
