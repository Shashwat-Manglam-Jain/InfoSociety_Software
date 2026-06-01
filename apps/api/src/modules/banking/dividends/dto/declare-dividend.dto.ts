import { IsNumber, IsUUID, Min } from "class-validator";

export class DeclareDividendDto {
  @IsUUID()
  financialYearId!: string;

  @IsNumber()
  @Min(0)
  ratePercent!: number;
}
