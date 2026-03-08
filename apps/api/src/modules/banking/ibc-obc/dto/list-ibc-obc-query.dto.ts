import { IbcObcType, InstrumentStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListIbcObcQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  societyCode?: string;

  @IsOptional()
  @IsEnum(IbcObcType)
  type?: IbcObcType;

  @IsOptional()
  @IsEnum(InstrumentStatus)
  status?: InstrumentStatus;
}
