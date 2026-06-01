import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateSocietyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  billingEmail?: string;

  @IsString()
  @IsOptional()
  billingPhone?: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  panNo?: string;

  @IsString()
  @IsOptional()
  gstNo?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  softwareUrl?: string;

  @IsString()
  @IsOptional()
  cin?: string;

  @IsString()
  @IsOptional()
  class?: string;

  @IsNumber()
  @IsOptional()
  authorizedCapital?: number;

  @IsNumber()
  @IsOptional()
  paidUpCapital?: number;

  @IsNumber()
  @IsOptional()
  shareNominalValue?: number;

  @IsString()
  @IsOptional()
  registrationState?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  registrationDate?: string;
}
