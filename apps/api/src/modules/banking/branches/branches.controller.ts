import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { CurrentUser } from "../../../common/auth/current-user.decorator";
import { RequestUser } from "../../../common/auth/request-user.interface";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto";

@Controller("banking/branches")
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.branchesService.list(user);
  }

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() body: CreateBranchDto
  ) {
    return this.branchesService.create(user, body);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() body: UpdateBranchDto
  ) {
    return this.branchesService.update(user, id, body);
  }
}

