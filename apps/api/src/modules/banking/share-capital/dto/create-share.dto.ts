import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateShareDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsString()
  certificateNo?: string;

  @IsInt()
  @Min(1)
  sharesHeld!: number;

  @IsNumber()
  @Min(0)
  faceValue!: number;

  @IsNumber()
  @Min(0)
  paidUpValue!: number;
}
