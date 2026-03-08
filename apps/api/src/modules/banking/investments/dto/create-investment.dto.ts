import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateInvestmentDto {
  @IsString()
  bankName!: string;

  @IsString()
  investmentType!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsNumber()
  @Min(0)
  interestRate!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  maturityDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maturityAmount?: number;
}
