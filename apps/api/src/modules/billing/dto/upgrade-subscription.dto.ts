import { IsIn, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "@prisma/client";
import { paymentMethodCatalog } from "../../shared/payment-methods";

export class UpgradeSubscriptionDto {
  @IsOptional()
  @IsIn(paymentMethodCatalog)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}
