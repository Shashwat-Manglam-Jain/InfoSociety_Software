import { TransactionMode, TransactionType } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionMode)
  mode?: TransactionMode;

  @IsOptional()
  @IsString()
  remark?: string;
}
