import { Module } from "@nestjs/common";
import { IbcObcController } from "./ibc-obc.controller";
import { IbcObcService } from "./ibc-obc.service";

@Module({
  controllers: [IbcObcController],
  providers: [IbcObcService]
})
export class IbcObcModule {}
