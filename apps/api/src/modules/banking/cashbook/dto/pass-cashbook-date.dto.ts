import { IsDateString, IsOptional } from "class-validator";

export class PassCashbookDateDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
