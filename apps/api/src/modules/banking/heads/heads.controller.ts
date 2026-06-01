import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { HeadsService } from "./heads.service";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";

@ApiBearerAuth()
@Controller("banking/heads")
export class HeadsController {
  constructor(private readonly headsService: HeadsService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get()
  list(@CurrentUser() user: RequestUser, @Query("relatedType") relatedType?: string) {
    return this.headsService.list(user, relatedType);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: { code: string; name: string; group: string; relatedType: string; accountCode: string }
  ) {
    return this.headsService.create(user, body);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Patch(":id")
  update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: Partial<{ name: string; group: string; relatedType: string; accountCode: string }>
  ) {
    return this.headsService.update(user, id, body);
  }
}

