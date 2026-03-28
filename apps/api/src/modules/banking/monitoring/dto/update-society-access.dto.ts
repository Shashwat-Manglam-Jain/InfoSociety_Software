import { SocietyStatus } from "@prisma/client";
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Length } from "class-validator";

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

  @IsOptional()
  @IsString()
  @Length(10, 20)
  panNo?: string;

  @IsOptional()
  @IsString()
  @Length(5, 20)
  tanNo?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  gstNo?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  category?: string;

  @IsOptional()
  @IsNumber()
  authorizedCapital?: number;

  @IsOptional()
  @IsNumber()
  paidUpCapital?: number;

  @IsOptional()
  @IsNumber()
  shareNominalValue?: number;

  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  registrationState?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  registrationAuthority?: string;
}
