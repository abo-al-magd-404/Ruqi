import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { AdminService } from "./admin.service";
import {
  UpdateStudentDto,
  UpdateStudentStatusDto,
  UpdateSubscribedMonthsDto,
} from "./dto";

import { Roles } from "../../common/decorators";
import { UserRole } from "../../common/enums";
import { JwtAuthGuard, RolesGuard } from "../../common/guards";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Get all students
  @Get("students")
  async getStudents() {
    return this.adminService.getStudents();
  }

  // Get student by studentId
  @Get("students/:studentId")
  async getStudentByStudentId(@Param("studentId") studentId: string) {
    return this.adminService.getStudentByStudentId(studentId);
  }

  // Update student data
  @Patch("students/:studentId")
  async updateStudent(
    @Param("studentId") studentId: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.adminService.updateStudent(studentId, updateStudentDto);
  }

  // Update student status
  @Patch("students/:studentId/status")
  async updateStudentStatus(
    @Param("studentId") studentId: string,
    @Body() updateStudentStatusDto: UpdateStudentStatusDto,
  ) {
    return this.adminService.updateStudentStatus(
      studentId,
      updateStudentStatusDto,
    );
  }

  // Get student's subscribed months
  @Get("students/:studentId/subscribed-months")
  async getSubscribedMonths(@Param("studentId") studentId: string) {
    return this.adminService.getSubscribedMonths(studentId);
  }

  // Add a month to student's subscriptions
  @Post("students/:studentId/subscribed-months")
  async addSubscribedMonth(
    @Param("studentId") studentId: string,
    @Body() updateSubscribedMonthsDto: UpdateSubscribedMonthsDto,
  ) {
    return this.adminService.addSubscribedMonth(
      studentId,
      updateSubscribedMonthsDto,
    );
  }

  // Remove a month from student's subscriptions
  @Delete("students/:studentId/subscribed-months")
  async removeSubscribedMonth(
    @Param("studentId") studentId: string,
    @Body() updateSubscribedMonthsDto: UpdateSubscribedMonthsDto,
  ) {
    return this.adminService.removeSubscribedMonth(
      studentId,
      updateSubscribedMonthsDto.monthId,
    );
  }

  // Delete student account
  @Delete("students/:studentId")
  async deleteStudent(@Param("studentId") studentId: string) {
    return this.adminService.deleteStudent(studentId);
  }
}
