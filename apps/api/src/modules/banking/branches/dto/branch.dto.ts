import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateBranchDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  societyId?: string;

  @IsOptional()
  @IsBoolean()
  isHead?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactNo?: string;

  @IsOptional()
  @IsBoolean()
  rechargeService?: boolean;

  @IsOptional()
  @IsBoolean()
  neftImpsService?: boolean;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  lockerFacility?: boolean;
}

export class UpdateBranchDto extends CreateBranchDto {}
