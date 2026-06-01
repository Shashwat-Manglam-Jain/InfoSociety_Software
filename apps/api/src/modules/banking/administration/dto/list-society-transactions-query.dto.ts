import { IsOptional, IsString } from "class-validator";

export class ListSocietyTransactionsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;
}
