import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateChequeEntryDto {
  @IsString()
  chequeNumber!: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsString()
  bankName!: string;

  @IsString()
  branchName!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
