import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../common/database/prisma.module";
import { HeadsController } from "./heads.controller";
import { HeadsService } from "./heads.service";

@Module({
  imports: [PrismaModule],
  controllers: [HeadsController],
  providers: [HeadsService]
})
export class HeadsModule {}

