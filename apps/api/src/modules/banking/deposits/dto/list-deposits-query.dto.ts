import { IsBooleanString, IsDateString, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListDepositsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  societyCode?: string;

  @IsOptional()
  @IsDateString()
  maturityBefore?: string;

  @IsOptional()
  @IsBooleanString()
  recurring?: string;
}
