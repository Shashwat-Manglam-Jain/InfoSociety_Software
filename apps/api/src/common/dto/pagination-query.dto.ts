import { Transform, type TransformFnParams } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(1)
  limit = 20;
}
