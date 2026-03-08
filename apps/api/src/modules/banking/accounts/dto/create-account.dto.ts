import { AccountType } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAccountDto {
  @IsString()
  customerId!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsString()
  branchCode?: string;

  @IsOptional()
  @IsBoolean()
  isPassbookEnabled?: boolean;
}
