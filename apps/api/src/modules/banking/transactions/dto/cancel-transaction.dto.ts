import { IsOptional, IsString } from "class-validator";

export class CancelTransactionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
