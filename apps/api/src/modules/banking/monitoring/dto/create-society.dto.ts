import { SocietyStatus } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateSocietyDto {
  @IsString()
  @Length(3, 20)
  @Matches(/^[A-Z0-9-]+$/)
  code!: string;

  @IsString()
  @Length(3, 120)
  name!: string;

  @IsOptional()
  @IsEnum(SocietyStatus)
  status?: SocietyStatus;

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
