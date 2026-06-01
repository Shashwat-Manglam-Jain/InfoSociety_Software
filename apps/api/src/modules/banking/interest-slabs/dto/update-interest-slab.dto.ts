import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateInterestSlabDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ratePercent?: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
