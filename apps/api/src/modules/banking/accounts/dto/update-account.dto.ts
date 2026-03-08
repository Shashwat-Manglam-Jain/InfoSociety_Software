import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAccountDto {
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
