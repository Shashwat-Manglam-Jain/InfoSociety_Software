import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class RenewDepositDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  principalAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
