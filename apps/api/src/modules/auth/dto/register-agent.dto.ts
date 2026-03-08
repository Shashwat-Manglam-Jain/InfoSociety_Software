import { IsString, MinLength } from "class-validator";

export class RegisterAgentDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsString()
  societyCode!: string;
}
