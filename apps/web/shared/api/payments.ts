import type {
  PaymentMethod,
  PaymentPurpose,
  PaymentRequestItem,
  PaymentTransactionItem,
  PaymentsOverview
} from "../types";
import { apiRequest } from "./http";

export type CreatePaymentRequestPayload = {
  customerId: string;
  title: string;
  description?: string;
  purpose: PaymentPurpose;
  amount: number;
  dueDate?: string;
};

export async function getPaymentsOverview(token: string): Promise<PaymentsOverview> {
  return apiRequest<PaymentsOverview>(token, "GET", "/payments/overview");
}

export async function listPaymentRequests(token: string): Promise<PaymentRequestItem[]> {
  return apiRequest<PaymentRequestItem[]>(token, "GET", "/payments/requests");
}

export async function listPaymentTransactions(token: string): Promise<PaymentTransactionItem[]> {
  return apiRequest<PaymentTransactionItem[]>(token, "GET", "/payments/transactions");
}

export async function createPaymentRequest(token: string, payload: CreatePaymentRequestPayload) {
  return apiRequest<PaymentRequestItem>(token, "POST", "/payments/requests", payload);
}

export async function payPaymentRequest(token: string, requestId: string, method: PaymentMethod, remark?: string) {
  return apiRequest<{
    request: PaymentRequestItem;
    transaction: PaymentTransactionItem;
    paymentInstructions: {
      acceptsDigitalPayments: boolean;
      upiId?: string | null;
      acceptedMethods: PaymentMethod[];
    };
  }>(token, "POST", `/payments/requests/${requestId}/pay`, {
    method,
    remark
  });
}

