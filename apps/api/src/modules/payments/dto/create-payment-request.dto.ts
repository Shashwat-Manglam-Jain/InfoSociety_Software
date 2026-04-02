import { PaymentPurpose } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreatePaymentRequestDto {
  @IsUUID()
  customerId!: string;

  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  description?: string;

  @IsEnum(PaymentPurpose)
  purpose!: PaymentPurpose;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
