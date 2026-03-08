import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class RenewInvestmentDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsDateString()
  maturityDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;
}
