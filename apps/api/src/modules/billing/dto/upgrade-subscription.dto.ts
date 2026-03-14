import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaymentMethod } from "@prisma/client";

export class UpgradeSubscriptionDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}
