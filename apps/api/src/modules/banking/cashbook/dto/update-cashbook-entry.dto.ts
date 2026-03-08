import { TransactionMode } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateCashbookEntryDto {
  @IsOptional()
  @IsEnum(TransactionMode)
  mode?: TransactionMode;

  @IsOptional()
  @IsString()
  remark?: string;
}
