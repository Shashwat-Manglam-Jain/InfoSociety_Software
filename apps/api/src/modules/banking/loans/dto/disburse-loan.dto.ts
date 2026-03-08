import { IsNumber, Min } from "class-validator";

export class DisburseLoanDto {
  @IsNumber()
  @Min(1)
  amount!: number;
}
