import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  societyCode?: string;

  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  kycVerified?: boolean;
}
