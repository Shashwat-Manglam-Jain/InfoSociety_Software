import {
  convertAmountToSubunits,
  formatCheckoutPrefillContact,
  isRazorpayDigitalMethod,
  mapPaymentMethodToRazorpay,
  normalizePhoneForRazorpay
} from "./razorpay";

describe("razorpay helpers", () => {
  it("converts rupees to paise", () => {
    expect(convertAmountToSubunits(1250.75)).toBe(125075);
  });

  it("normalizes phone numbers for Razorpay", () => {
    expect(normalizePhoneForRazorpay("+91 98765 43210")).toBe("919876543210");
    expect(normalizePhoneForRazorpay("9876543210")).toBe("919876543210");
    expect(normalizePhoneForRazorpay("")).toBeNull();
  });

  it("formats checkout prefill contacts", () => {
    expect(formatCheckoutPrefillContact("9876543210")).toBe("+919876543210");
    expect(formatCheckoutPrefillContact(undefined)).toBeUndefined();
  });

  it("maps supported payment methods to Razorpay checkout methods", () => {
    expect(mapPaymentMethodToRazorpay("UPI")).toBe("upi");
    expect(mapPaymentMethodToRazorpay("NET_BANKING")).toBe("netbanking");
    expect(mapPaymentMethodToRazorpay("DEBIT_CARD")).toBe("card");
    expect(mapPaymentMethodToRazorpay("CASH")).toBeNull();
    expect(isRazorpayDigitalMethod("CASH")).toBe(false);
    expect(isRazorpayDigitalMethod("CREDIT_CARD")).toBe(true);
  });
});
