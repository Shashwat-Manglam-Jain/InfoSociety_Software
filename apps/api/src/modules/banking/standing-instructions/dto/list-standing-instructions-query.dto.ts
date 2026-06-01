import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListStandingInstructionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  activeOnly?: string;
}
