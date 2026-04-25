import type { PaymentMethod } from "@/shared/types";

export const RAZORPAY_CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpayCheckoutMethod = "card" | "netbanking" | "upi";
export type RazorpayPayoutMode = "IMPS" | "NEFT" | "RTGS";

export function convertAmountToSubunits(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a valid amount greater than zero.");
  }

  return Math.round(amount * 100);
}

export function normalizePhoneForRazorpay(value?: string | null) {
  if (!value) {
    return null;
  }

  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export function formatCheckoutPrefillContact(value?: string | null) {
  const normalized = normalizePhoneForRazorpay(value);

  return normalized ? `+${normalized}` : undefined;
}

export function mapPaymentMethodToRazorpay(method: PaymentMethod): RazorpayCheckoutMethod | null {
  switch (method) {
    case "UPI":
      return "upi";
    case "NET_BANKING":
      return "netbanking";
    case "DEBIT_CARD":
    case "CREDIT_CARD":
      return "card";
    default:
      return null;
  }
}

export function isRazorpayDigitalMethod(method: PaymentMethod) {
  return mapPaymentMethodToRazorpay(method) !== null;
}
