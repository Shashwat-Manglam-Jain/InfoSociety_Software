import { SocietyStatus } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";

export class UpdateSocietyAccessDto {
  @IsOptional()
  @IsEnum(SocietyStatus)
  status?: SocietyStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  billingPhone?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  billingAddress?: string;

  @IsOptional()
  @IsBoolean()
  acceptsDigitalPayments?: boolean;

  @IsOptional()
  @IsString()
  @Length(3, 120)
  upiId?: string;
}
