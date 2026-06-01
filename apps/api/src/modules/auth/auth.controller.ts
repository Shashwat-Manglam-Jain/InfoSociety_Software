import { Body, Controller, Get, HttpCode, Param, Patch, Post, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Response } from "express";
import { getAuthCookieName, getAuthCookieOptions } from "../../common/auth/auth-cookie";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import { RequestUser } from "../../common/auth/request-user.interface";
import { Roles } from "../../common/auth/roles.decorator";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterAgentDto } from "./dto/register-agent.dto";
import { RegisterClientDto } from "./dto/register-client.dto";
import { RegisterSocietyDto } from "./dto/register-society.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

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
  @Get("platform-stats")
  getPlatformStats() {
    return this.authService.getPlatformStats();
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
  changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user, dto);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user);
  }

  @ApiBearerAuth()
  @Patch("me")
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.authService.updateMyProfile(user, dto);
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
