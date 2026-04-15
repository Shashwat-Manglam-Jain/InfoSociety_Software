import { PaymentMethod } from "@prisma/client";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { paymentMethodCatalog } from "../../shared/payment-methods";

export class PayPaymentRequestDto {
  @IsIn(paymentMethodCatalog)
  method!: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  remark?: string;
}
