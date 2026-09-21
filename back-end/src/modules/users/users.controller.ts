import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateStudentProfileDto } from "./dto";
import { JwtAuthGuard, RolesGuard } from "../../common/guards";
import { UserRole } from "../../common/enums";
import { Roles } from "../../common/decorators";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.usersService.getMyProfile(userId);
  }

  @Patch("student/profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async updateStudentProfile(
    @Req() req: any,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.usersService.updateStudentProfile(
      userId,
      updateStudentProfileDto,
    );
  }
}
