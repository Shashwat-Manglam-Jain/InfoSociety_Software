import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { BranchesService } from "./branches.service";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { Roles } from "../../../common/auth/roles.decorator";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto";

@Controller("banking/branches")
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.branchesService.list(user);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateBranchDto
  ) {
    return this.branchesService.create(user, body);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.SUPER_USER)
  @Patch(":id")
  update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: UpdateBranchDto
  ) {
    return this.branchesService.update(user, id, body);
  }
}

