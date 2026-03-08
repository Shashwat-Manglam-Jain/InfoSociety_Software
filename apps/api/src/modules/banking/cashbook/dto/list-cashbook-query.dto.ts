import { IsDateString, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListCashbookQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  societyCode?: string;

  @IsOptional()
  @IsString()
  isPosted?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
