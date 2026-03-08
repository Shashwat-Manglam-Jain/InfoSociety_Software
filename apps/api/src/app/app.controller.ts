import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/auth/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      service: "Infopath Info Banking API",
      version: "1.0.0",
      docs: "/api/docs",
      basePath: "/api/v1"
    };
  }
}
