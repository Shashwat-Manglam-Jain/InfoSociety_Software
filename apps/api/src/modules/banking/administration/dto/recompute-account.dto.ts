import { IsDateString, IsOptional } from "class-validator";

export class RecomputeAccountDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;
}
