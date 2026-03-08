import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class WithdrawInvestmentDto {
  @IsOptional()
  @IsDateString()
  withdrawnDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maturityAmount?: number;
}
