import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDemandDraftDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  beneficiary!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
