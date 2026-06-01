import { IsDateString, IsNumber, IsString, IsUUID, Min } from "class-validator";

export class CreateStandingInstructionDto {
  @IsUUID()
  sourceAccountId!: string;

  @IsUUID()
  targetAccountId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  frequency!: string;

  @IsDateString()
  nextExecutionAt!: string;
}
