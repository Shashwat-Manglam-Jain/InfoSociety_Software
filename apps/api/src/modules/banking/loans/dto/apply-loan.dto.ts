import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class ApplyLoanDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsNumber()
  @Min(1)
  applicationAmount!: number;

  @IsNumber()
  @Min(0)
  interestRate!: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  guarantor1Id?: string;

  @IsOptional()
  @IsString()
  guarantor2Id?: string;

  @IsOptional()
  @IsString()
  guarantor3Id?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
