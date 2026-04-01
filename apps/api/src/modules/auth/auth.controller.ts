import { Body, Controller, Get, HttpCode, Post, Req } from "@nestjs/common";
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
import { RegisterSocietyDto } from "./dto/register-society.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(200)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("register/client")
  registerClient(@Body() dto: RegisterClientDto) {
    return this.authService.registerClient(dto);
  }

  @Public()
  @Post("register/agent/self")
  registerAgentSelf(@Body() dto: RegisterAgentDto) {
    return this.authService.registerAgentSelf(dto);
  }

  @Public()
  @Post("register/society")
  registerSociety(@Body() dto: RegisterSocietyDto) {
    return this.authService.registerSociety(dto);
  }

  @Public()
  @Get("societies")
  listSocieties() {
    return this.authService.listActiveSocieties();
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Post("register/agent")
  registerAgent(@Body() dto: RegisterAgentDto) {
    return this.authService.registerAgent(dto);
  }

  @ApiBearerAuth()
  @Post("change-password")
  changePassword(@Req() req: Request & { user: RequestUser }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user, dto);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@Req() req: Request & { user: RequestUser }) {
    return this.authService.me(req.user);
  }
}
