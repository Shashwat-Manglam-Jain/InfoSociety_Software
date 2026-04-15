import { PaymentMethod } from "@prisma/client";

export const CASH_PAYMENT_METHOD = "CASH" as PaymentMethod;

export const supportsCashPaymentMethod = Object.values(PaymentMethod).includes(CASH_PAYMENT_METHOD);

export const paymentMethodCatalog: PaymentMethod[] = supportsCashPaymentMethod
  ? [CASH_PAYMENT_METHOD, PaymentMethod.UPI, PaymentMethod.DEBIT_CARD, PaymentMethod.CREDIT_CARD, PaymentMethod.NET_BANKING]
  : [PaymentMethod.UPI, PaymentMethod.DEBIT_CARD, PaymentMethod.CREDIT_CARD, PaymentMethod.NET_BANKING];

export const cashOnlyPaymentMethods: PaymentMethod[] = supportsCashPaymentMethod ? [CASH_PAYMENT_METHOD] : [];

export function isCashPaymentMethod(method: PaymentMethod | null | undefined) {
  return supportsCashPaymentMethod && method === CASH_PAYMENT_METHOD;
}
