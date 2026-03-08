import { IsOptional, IsString } from "class-validator";

export class CloseLockerDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
