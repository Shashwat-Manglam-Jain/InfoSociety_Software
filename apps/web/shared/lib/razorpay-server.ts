import crypto from "node:crypto";
import { convertAmountToSubunits, normalizePhoneForRazorpay, type RazorpayPayoutMode } from "@/shared/lib/razorpay";

const RAZORPAY_API_BASE_URL = "https://api.razorpay.com/v1";

type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
};

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string | null;
  status: string;
};

type RazorpayContactResponse = {
  id: string;
  name: string;
  email?: string | null;
  contact?: string | null;
  type: string;
};

type RazorpayFundAccountResponse = {
  id: string;
  contact_id: string;
  account_type: "bank_account";
  bank_account: {
    name: string;
    ifsc: string;
    bank_name?: string | null;
    account_number: string;
  };
};

type RazorpayPayoutResponse = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  mode: RazorpayPayoutMode;
  purpose: string;
  fund_account_id: string;
  reference_id?: string | null;
  utr?: string | null;
  narration?: string | null;
};

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured on the server.`);
  }

  return value;
}

function getPaymentCredentials(): RazorpayCredentials {
  return {
    keyId: requireEnv("RAZORPAY_KEY_ID"),
    keySecret: requireEnv("RAZORPAY_KEY_SECRET")
  };
}

function getPayoutCredentials(): RazorpayCredentials {
  const keyId = process.env.RAZORPAYX_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAYX_KEY_SECRET?.trim() || process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("RazorpayX credentials are not configured on the server.");
  }

  return { keyId, keySecret };
}

function buildAuthHeader(credentials: RazorpayCredentials) {
  return `Basic ${Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64")}`;
}

function extractRazorpayError(payload: unknown, status: number) {
  if (typeof payload === "object" && payload !== null) {
    const errorObject = (payload as { error?: { description?: string; reason?: string; field?: string } }).error;

    if (errorObject?.description) {
      return errorObject.description;
    }

    if (errorObject?.reason) {
      return errorObject.reason;
    }

    if (errorObject?.field) {
      return `Razorpay rejected the request field: ${errorObject.field}`;
    }
  }

  return `Razorpay request failed with status ${status}.`;
}

async function razorpayRequest<T>(
  path: string,
  body: Record<string, unknown>,
  options: {
    credentials: RazorpayCredentials;
    idempotencyKey?: string;
  }
): Promise<T> {
  const response = await fetch(`${RAZORPAY_API_BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: buildAuthHeader(options.credentials),
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "X-Payout-Idempotency": options.idempotencyKey } : {})
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
    throw new Error(extractRazorpayError(payload, response.status));
  }

  return payload as T;
}

export function getRazorpayMerchantName() {
  return process.env.RAZORPAY_MERCHANT_NAME?.trim() || "InfoSociety";
}

export function getRazorpayPaymentKeyId() {
  return getPaymentCredentials().keyId;
}

export function getRazorpayPayoutSourceAccountNumber() {
  return requireEnv("RAZORPAYX_ACCOUNT_NUMBER");
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return razorpayRequest<RazorpayOrderResponse>(
    "/orders",
    {
      amount: convertAmountToSubunits(input.amount),
      currency: input.currency ?? "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes ?? {}
    },
    {
      credentials: getPaymentCredentials()
    }
  );
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const signature = crypto
    .createHmac("sha256", getPaymentCredentials().keySecret)
    .update(`${input.orderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  const actual = Buffer.from(signature);
  const expected = Buffer.from(input.razorpaySignature);

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export async function createRazorpayContact(input: {
  name: string;
  email?: string | null;
  contact?: string | null;
  referenceId: string;
  notes?: Record<string, string>;
}) {
  const normalizedContact = normalizePhoneForRazorpay(input.contact);

  return razorpayRequest<RazorpayContactResponse>(
    "/contacts",
    {
      name: input.name.slice(0, 50),
      email: input.email || undefined,
      contact: normalizedContact ?? undefined,
      type: "vendor",
      reference_id: input.referenceId.slice(0, 40),
      notes: input.notes ?? {}
    },
    {
      credentials: getPayoutCredentials()
    }
  );
}

export async function createRazorpayBankFundAccount(input: {
  contactId: string;
  beneficiaryName: string;
  accountNumber: string;
  ifsc: string;
}) {
  return razorpayRequest<RazorpayFundAccountResponse>(
    "/fund_accounts",
    {
      contact_id: input.contactId,
      account_type: "bank_account",
      bank_account: {
        name: input.beneficiaryName,
        ifsc: input.ifsc.toUpperCase(),
        account_number: input.accountNumber
      }
    },
    {
      credentials: getPayoutCredentials()
    }
  );
}

export async function createRazorpayBankPayout(input: {
  fundAccountId: string;
  amount: number;
  mode: RazorpayPayoutMode;
  purpose: string;
  referenceId: string;
  narration?: string;
  notes?: Record<string, string>;
}) {
  return razorpayRequest<RazorpayPayoutResponse>(
    "/payouts",
    {
      account_number: getRazorpayPayoutSourceAccountNumber(),
      fund_account_id: input.fundAccountId,
      amount: convertAmountToSubunits(input.amount),
      currency: "INR",
      mode: input.mode,
      purpose: input.purpose,
      queue_if_low_balance: true,
      reference_id: input.referenceId.slice(0, 40),
      narration: input.narration?.slice(0, 30) || undefined,
      notes: input.notes ?? {}
    },
    {
      credentials: getPayoutCredentials(),
      idempotencyKey: crypto.randomUUID()
    }
  );
}
