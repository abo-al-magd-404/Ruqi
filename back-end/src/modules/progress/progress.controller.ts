import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Types } from "mongoose";
import type { Request } from "express";

import { ProgressService } from "./progress.service";
import { SubmitAnswersDto, UpdateLessonProgressDto } from "./dto";

import { JwtAuthGuard } from "../../common/guards";
import { UserRole } from "../../common/enums";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // ============================================================
  // Helpers
  // ============================================================

  private getAuthenticatedStudentId(
    req: AuthenticatedRequest,
  ): Types.ObjectId {
    const userId = req.user?.id;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException("جلسة غير صالحة");
    }

    return new Types.ObjectId(userId);
  }

  private getValidObjectId(id: string, message: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new UnauthorizedException(message);
    }

    return new Types.ObjectId(id);
  }

  // ============================================================
  // Lesson Progress
  // ============================================================

  @Post("lessons/:lessonId")
  async updateLessonProgress(
    @Param("lessonId") lessonId: string,
    @Body() dto: UpdateLessonProgressDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validLessonId = this.getValidObjectId(
      lessonId,
      "معرّف الدرس غير صالح",
    );

    return this.progressService.updateLessonProgress(
      studentId,
      validLessonId,
      dto,
    );
  }

  @Post("lessons/:lessonId/homework")
  async submitHomework(
    @Param("lessonId") lessonId: string,
    @Body() dto: SubmitAnswersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validLessonId = this.getValidObjectId(
      lessonId,
      "معرّف الدرس غير صالح",
    );

    return this.progressService.submitHomework(
      studentId,
      validLessonId,
      dto,
    );
  }

  @Get("lessons/:lessonId")
  async getLessonProgress(
    @Param("lessonId") lessonId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validLessonId = this.getValidObjectId(
      lessonId,
      "معرّف الدرس غير صالح",
    );

    return this.progressService.getLessonProgress(
      studentId,
      validLessonId,
    );
  }

  // ============================================================
  // Exam Progress
  // ============================================================

  @Post("exams/:examId")
  async submitExam(
    @Param("examId") examId: string,
    @Body() dto: SubmitAnswersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validExamId = this.getValidObjectId(
      examId,
      "معرّف الاختبار غير صالح",
    );

    return this.progressService.submitExam(
      studentId,
      validExamId,
      dto,
    );
  }

  @Get("exams/:examId")
  async getExamProgress(
    @Param("examId") examId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validExamId = this.getValidObjectId(
      examId,
      "معرّف الاختبار غير صالح",
    );

    return this.progressService.getExamProgress(
      studentId,
      validExamId,
    );
  }

  // ============================================================
  // Month Progress
  // ============================================================

  @Get("months/:monthId")
  async getMonthProgress(
    @Param("monthId") monthId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const studentId = this.getAuthenticatedStudentId(req);

    const validMonthId = this.getValidObjectId(
      monthId,
      "معرّف الشهر غير صالح",
    );

    return this.progressService.getMonthProgress(
      studentId,
      validMonthId,
    );
  }
}
