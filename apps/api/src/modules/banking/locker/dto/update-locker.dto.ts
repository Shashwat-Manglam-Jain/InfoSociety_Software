import { LockerSize } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateLockerDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  lockerNumber?: string;

  @IsOptional()
  @IsEnum(LockerSize)
  size?: LockerSize;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualCharge?: number;
}
