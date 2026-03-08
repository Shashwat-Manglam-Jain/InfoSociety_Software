import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class OpenDepositAccountDto {
  @IsString()
  accountId!: string;

  @IsString()
  schemeId!: string;

  @IsNumber()
  @Min(0)
  principalAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMonths?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
