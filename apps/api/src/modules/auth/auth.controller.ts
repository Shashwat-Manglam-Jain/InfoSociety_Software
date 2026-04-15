import { Body, Controller, Get, HttpCode, Param, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Request, Response } from "express";
import { getAuthCookieName, getAuthCookieOptions } from "../../common/auth/auth-cookie";
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
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @HttpCode(200)
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    this.attachAuthCookie(response, result.accessToken);
    return result;
  }

  @Public()
  @Post("register/client")
  async registerClient(@Body() dto: RegisterClientDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.registerClient(dto);
    this.attachAuthCookie(response, result.accessToken);
    return result;
  }

  @Public()
  @Post("register/agent/self")
  async registerAgentSelf(@Body() dto: RegisterAgentDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.registerAgentSelf(dto);
    this.attachAuthCookie(response, result.accessToken);
    return result;
  }

  @Public()
  @Post("register/society")
  async registerSociety(@Body() dto: RegisterSocietyDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.registerSociety(dto);
    this.attachAuthCookie(response, result.accessToken);
    return result;
  }

  @Public()
  @Get("societies")
  listSocieties() {
    return this.authService.listActiveSocieties();
  }

  @Public()
  @Get("societies/:societyCode/branches")
  listSocietyBranches(@Param("societyCode") societyCode: string) {
    return this.authService.listActiveSocietyBranches(societyCode);
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

  @Public()
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(getAuthCookieName(this.configService), {
      ...getAuthCookieOptions(this.configService),
      maxAge: undefined
    });

    return {
      success: true
    };
  }

  private attachAuthCookie(response: Response, accessToken: string) {
    response.cookie(getAuthCookieName(this.configService), accessToken, getAuthCookieOptions(this.configService));
  }
}
