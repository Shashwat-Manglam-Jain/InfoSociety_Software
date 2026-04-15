import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
    message: "Password must include uppercase, lowercase, number, and special character"
  })
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{12}$/, {
    message: "Aadhaar number must be exactly 12 digits"
  })
  aadhaarNumber!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedModuleSlugs?: string[];
}
