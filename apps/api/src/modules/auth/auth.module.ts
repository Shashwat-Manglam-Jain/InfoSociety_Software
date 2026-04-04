import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/auth/roles.guard";
import { WorkspaceAccessGuard } from "../../common/auth/workspace-access.guard";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PlatformSuperAdminBootstrapService } from "./platform-superadmin-bootstrap.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PlatformSuperAdminBootstrapService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: WorkspaceAccessGuard
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
