import type { RazorpayPayoutMode } from "@/shared/lib/razorpay";

type LocalRequestOptions = {
  body: Record<string, unknown>;
  path: string;
};

async function requestLocalJson<T>({ body, path }: LocalRequestOptions): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
}

export type CreateRazorpayOrderPayload = {
  amount: number;
  title: string;
  description?: string;
  requestId: string;
  societyCode: string;
  purpose: string;
  initiatedByRole: string;
  paymentMethod: string;
  customer?: {
    name?: string;
    email?: string | null;
    contact?: string | null;
  };
};

export type RazorpayOrderIntent = {
  keyId: string;
  merchantName: string;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt?: string | null;
    status: string;
  };
};

export async function createRazorpayCheckoutOrder(payload: CreateRazorpayOrderPayload) {
  return requestLocalJson<RazorpayOrderIntent>({
    path: "/api/razorpay/orders",
    body: payload
  });
}

export type VerifyRazorpayOrderPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export async function verifyRazorpayCheckoutOrder(payload: VerifyRazorpayOrderPayload) {
  return requestLocalJson<{
    verified: true;
    orderId: string;
    paymentId: string;
  }>({
    path: "/api/razorpay/verify",
    body: payload
  });
}

export type CreateRazorpayBankPayoutPayload = {
  beneficiaryName: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  accountNumber: string;
  ifsc: string;
  amount: number;
  mode: RazorpayPayoutMode;
  purpose: string;
  narration?: string;
  referenceId?: string;
};

export async function createRazorpayBankPayoutRequest(payload: CreateRazorpayBankPayoutPayload) {
  return requestLocalJson<{
    payout: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      mode: RazorpayPayoutMode;
      purpose: string;
      fundAccountId: string;
      contactId: string;
      referenceId?: string | null;
      utr?: string | null;
      narration?: string | null;
    };
  }>({
    path: "/api/razorpay/payouts",
    body: payload
  });
}
