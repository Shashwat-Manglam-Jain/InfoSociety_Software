import { IsOptional, IsString, IsUUID } from "class-validator";
import { PaginationQueryDto } from "../../../../common/dto/pagination-query.dto";

export class ListLoanNoticesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  loanId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  noticeType?: string;
}
