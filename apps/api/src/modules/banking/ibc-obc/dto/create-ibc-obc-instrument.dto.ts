import { IbcObcType } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateIbcObcInstrumentDto {
  @IsString()
  instrumentNumber!: string;

  @IsEnum(IbcObcType)
  type!: IbcObcType;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
