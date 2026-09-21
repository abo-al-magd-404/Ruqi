import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "../../common/enums";
import { JwtAuthGuard, RolesGuard } from "../../common/guards";
import { Roles } from "../../common/decorators";
import { ProgressService } from "./progress.service";
import { ParseMongoIdPipe } from "../../common/pipes";
import { SubmitAnswersDto, UpdateLessonProgressDto } from "./dto";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}

@Controller("progress")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Patch("lessons/:lessonId")
  async updateLessonProgress(
    @Req() req: AuthenticatedRequest,
    @Param("lessonId", ParseMongoIdPipe) lessonId: string,
    @Body() dto: UpdateLessonProgressDto,
  ) {
    return this.progressService.updateLessonProgress(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(lessonId),
      dto,
    );
  }

  @Get("lessons/:lessonId")
  async getLessonProgress(
    @Req() req: AuthenticatedRequest,
    @Param("lessonId", ParseMongoIdPipe) lessonId: string,
  ) {
    return this.progressService.getLessonProgress(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(lessonId),
    );
  }

  @Post("lessons/:lessonId/homework")
  async submitHomework(
    @Req() req: AuthenticatedRequest,
    @Param("lessonId", ParseMongoIdPipe) lessonId: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.progressService.submitHomework(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(lessonId),
      dto,
    );
  }

  @Get("exams/:examId")
  async getExamProgress(
    @Req() req: AuthenticatedRequest,
    @Param("examId", ParseMongoIdPipe) examId: string,
  ) {
    return this.progressService.getExamProgress(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(examId),
    );
  }

  @Post("exams/:examId/submit")
  async submitExam(
    @Req() req: AuthenticatedRequest,
    @Param("examId", ParseMongoIdPipe) examId: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.progressService.submitExam(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(examId),
      dto,
    );
  }

  @Get("months/:monthId")
  async getMonthProgress(
    @Req() req: AuthenticatedRequest,
    @Param("monthId", ParseMongoIdPipe) monthId: string,
  ) {
    return this.progressService.getMonthProgress(
      new Types.ObjectId(req.user.id),
      new Types.ObjectId(monthId),
    );
  }
}
