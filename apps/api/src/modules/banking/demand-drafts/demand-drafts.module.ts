import { Module } from "@nestjs/common";
import { DemandDraftsController } from "./demand-drafts.controller";
import { DemandDraftsService } from "./demand-drafts.service";

@Module({
  controllers: [DemandDraftsController],
  providers: [DemandDraftsService]
})
export class DemandDraftsModule {}
