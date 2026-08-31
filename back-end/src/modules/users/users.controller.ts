import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
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
  async getMe(@Req() req: any) {
    return this.usersService.findMe(req.user.userId);
  }

  @Patch('student/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  async updateStudentProfile(
    @Req() req: any,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    return this.usersService.updateStudentProfile(
      req.user.id,
      updateStudentProfileDto,
    );
  }
}
