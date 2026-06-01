import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListSharesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
