import { IsNumber, Min } from "class-validator";

export class UpdateOverdueDto {
  @IsNumber()
  @Min(0)
  overdueAmount!: number;
}
