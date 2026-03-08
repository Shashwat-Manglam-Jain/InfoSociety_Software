import { InstrumentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListChequeClearingQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  societyCode?: string;

  @IsOptional()
  @IsEnum(InstrumentStatus)
  status?: InstrumentStatus;
}
