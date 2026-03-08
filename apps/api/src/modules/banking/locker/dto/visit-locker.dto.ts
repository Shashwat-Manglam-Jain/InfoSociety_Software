import { IsOptional, IsString } from "class-validator";

export class VisitLockerDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}
