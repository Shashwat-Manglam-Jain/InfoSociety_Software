import { UserRole } from "@prisma/client";
import { IsEnum, IsIn, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsOptional()
  societyCode?: string;

  @IsEnum(UserRole)
  @IsOptional()
  expectedRole?: UserRole;

  /** Last 4 digits of the user's Aadhaar card – optional extra identity step */
  @IsString()
  @IsOptional()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: "aadhaarLast4 must be exactly 4 digits" })
  aadhaarLast4?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ADMIN', 'STAFF', 'AGENT', 'CLIENT'])
  portalSource?: 'ADMIN' | 'STAFF' | 'AGENT' | 'CLIENT';
}
