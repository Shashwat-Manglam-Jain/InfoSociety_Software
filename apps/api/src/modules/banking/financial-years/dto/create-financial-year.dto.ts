import { IsDateString, IsString } from "class-validator";

export class CreateFinancialYearDto {
  @IsString()
  label!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
