import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: "ok",
      service: "infopath-api",
      timestamp: new Date().toISOString()
    };
  }
}
