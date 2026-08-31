import { Controller, Patch, Body, UseGuards, Req, Get } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.usersService.getMyProfile(userId);
  }

  @Patch('student/profile')
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
