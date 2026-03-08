import { TransactionMode, TransactionType } from "@prisma/client";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCashbookEntryDto {
  @IsString()
  headCode!: string;

  @IsString()
  headName!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsEnum(TransactionMode)
  mode!: TransactionMode;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsDateString()
  entryDate?: string;
}
