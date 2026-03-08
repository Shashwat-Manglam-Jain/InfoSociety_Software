import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateDemandDraftDto {
  @IsOptional()
  @IsString()
  beneficiary?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
