import { LockerSize } from "@prisma/client";
import { IsEnum, IsNumber, IsString, Min } from "class-validator";

export class CreateLockerDto {
  @IsString()
  customerId!: string;

  @IsString()
  lockerNumber!: string;

  @IsEnum(LockerSize)
  size!: LockerSize;

  @IsNumber()
  @Min(0)
  annualCharge!: number;
}
