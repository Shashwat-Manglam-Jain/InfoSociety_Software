import { Module } from "@nestjs/common";
import { InterestSlabsController } from "./interest-slabs.controller";
import { InterestSlabsService } from "./interest-slabs.service";

@Module({
  controllers: [InterestSlabsController],
  providers: [InterestSlabsService]
})
export class InterestSlabsModule {}
