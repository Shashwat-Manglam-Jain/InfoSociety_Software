import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateChequeEntryDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
