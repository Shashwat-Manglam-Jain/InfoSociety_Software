import { IsNumber, Min } from "class-validator";

export class RecoverLoanDto {
  @IsNumber()
  @Min(1)
  amount!: number;
}
