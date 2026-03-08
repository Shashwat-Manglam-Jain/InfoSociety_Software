import { InstrumentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListDemandDraftsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(InstrumentStatus)
  status?: InstrumentStatus;

  @IsOptional()
  @IsString()
  societyCode?: string;
}
