import { Module } from "@nestjs/common";
import { LoanNoticesController } from "./loan-notices.controller";
import { LoanNoticesService } from "./loan-notices.service";

@Module({
  controllers: [LoanNoticesController],
  providers: [LoanNoticesService]
})
export class LoanNoticesModule {}
