import { IsDateString, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListInvestmentsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsDateString()
  maturityBefore?: string;

  @IsOptional()
  @IsString()
  activeOnly?: string;
}
