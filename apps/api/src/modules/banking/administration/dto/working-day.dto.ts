import { IsDateString, IsOptional } from "class-validator";

export class WorkingDayDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}
