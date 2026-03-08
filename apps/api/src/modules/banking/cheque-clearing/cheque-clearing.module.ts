import { Module } from "@nestjs/common";
import { ChequeClearingController } from "./cheque-clearing.controller";
import { ChequeClearingService } from "./cheque-clearing.service";

@Module({
  controllers: [ChequeClearingController],
  providers: [ChequeClearingService]
})
export class ChequeClearingModule {}
