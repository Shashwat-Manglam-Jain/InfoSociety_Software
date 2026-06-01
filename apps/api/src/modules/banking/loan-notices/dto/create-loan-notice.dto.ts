import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { LoanNoticeType } from "@prisma/client";

export class CreateLoanNoticeDto {
  @IsUUID()
  loanId!: string;

  @IsUUID()
  customerId!: string;

  @IsEnum(LoanNoticeType)
  noticeType!: LoanNoticeType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
