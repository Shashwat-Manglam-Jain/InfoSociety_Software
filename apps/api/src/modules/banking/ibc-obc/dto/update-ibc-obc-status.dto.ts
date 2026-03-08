import { InstrumentStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateIbcObcStatusDto {
  @IsEnum(InstrumentStatus)
  status!: InstrumentStatus;
}
