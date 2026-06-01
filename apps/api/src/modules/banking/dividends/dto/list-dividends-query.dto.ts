import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListDividendsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}
