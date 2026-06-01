import { Module } from "@nestjs/common";
import { ShareCapitalController } from "./share-capital.controller";
import { ShareCapitalService } from "./share-capital.service";

@Module({
  controllers: [ShareCapitalController],
  providers: [ShareCapitalService]
})
export class ShareCapitalModule {}
