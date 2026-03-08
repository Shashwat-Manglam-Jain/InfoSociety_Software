import { IsObject, IsOptional, IsString } from "class-validator";

export class RunReportDto {
  @IsString()
  category!: string;

  @IsString()
  reportName!: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}
