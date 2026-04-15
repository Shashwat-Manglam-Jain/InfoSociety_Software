import { IsArray, IsBoolean, IsOptional, IsString, Matches, MinLength, ValidateIf } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((_, value) => typeof value === "string" && value.trim().length > 0)
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: "Password must include uppercase, lowercase, number, and special character"
  })
  password?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{12}$/, {
    message: "Aadhaar number must be exactly 12 digits"
  })
  aadhaarNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedModuleSlugs?: string[];
}
