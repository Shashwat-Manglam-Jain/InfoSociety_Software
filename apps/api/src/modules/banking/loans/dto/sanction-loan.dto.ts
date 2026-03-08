import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class SanctionLoanDto {
  @IsNumber()
  @Min(1)
  sanctionedAmount!: number;

  @IsOptional()
  @IsDateString()
  sanctionDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
