import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { Public } from "../../common/auth/public.decorator";
import { RequestUser } from "../../common/auth/request-user.interface";
import { Roles } from "../../common/auth/roles.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { RegisterClientDto } from "./dto/register-client.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("register/client")
  registerClient(@Body() dto: RegisterClientDto) {
    return this.authService.registerClient(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_USER)
  @Post("register/agent")
  registerAgent(@Body() dto: RegisterAgentDto) {
    return this.authService.registerAgent(dto);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@Req() req: Request & { user: RequestUser }) {
    return this.authService.me(req.user);
  }
}
