import { IsBoolean, IsDateString, IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterSocietyDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  societyCode!: string;

  @IsString()
  societyName!: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  billingPhone?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsBoolean()
  acceptsDigitalPayments?: boolean;

  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsString()
  panNo?: string;

  @IsOptional()
  @IsString()
  tanNo?: string;

  @IsOptional()
  @IsString()
  gstNo?: string;

  @IsOptional()
  @IsString()
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
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  registrationState?: string;

  @IsOptional()
  @IsString()
  registrationAuthority?: string;
}
