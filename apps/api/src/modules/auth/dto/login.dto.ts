import { UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

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
}
