import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateShareDto {
  @IsOptional()
  @IsString()
  certificateNo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sharesHeld?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  faceValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidUpValue?: number;
}
