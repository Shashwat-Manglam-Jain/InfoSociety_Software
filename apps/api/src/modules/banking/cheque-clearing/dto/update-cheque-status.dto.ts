import { InstrumentStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateChequeStatusDto {
  @IsEnum(InstrumentStatus)
  status!: InstrumentStatus;
}
