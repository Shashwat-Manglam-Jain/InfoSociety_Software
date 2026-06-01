import { IsDateString, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateStandingInstructionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsDateString()
  nextExecutionAt?: string;
}
