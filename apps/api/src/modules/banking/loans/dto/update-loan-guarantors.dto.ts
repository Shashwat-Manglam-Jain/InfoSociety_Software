import { IsOptional, IsString } from "class-validator";

export class UpdateLoanGuarantorsDto {
  @IsOptional()
  @IsString()
  guarantor1Id?: string | null;

  @IsOptional()
  @IsString()
  guarantor2Id?: string | null;

  @IsOptional()
  @IsString()
  guarantor3Id?: string | null;

  @IsOptional()
  @IsString()
  remarks?: string | null;
}
