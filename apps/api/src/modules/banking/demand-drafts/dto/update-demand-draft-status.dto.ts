import { InstrumentStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateDemandDraftStatusDto {
  @IsEnum(InstrumentStatus)
  status!: InstrumentStatus;
}
