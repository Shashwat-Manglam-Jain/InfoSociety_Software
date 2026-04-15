import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateDepositSchemeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(1)
  minMonths!: number;

  @IsNumber()
  @Min(1)
  maxMonths!: number;

  @IsNumber()
  @Min(0)
  interestRate!: number;

  @IsBoolean()
  recurring!: boolean;
}
