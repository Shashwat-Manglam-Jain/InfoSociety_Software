import { Module } from "@nestjs/common";
import { StandingInstructionsController } from "./standing-instructions.controller";
import { StandingInstructionsService } from "./standing-instructions.service";

@Module({
  controllers: [StandingInstructionsController],
  providers: [StandingInstructionsService]
})
export class StandingInstructionsModule {}
