import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { EducationalContentService } from "./educational-content.service";
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
  RolesGuard,
} from "../../common/guards";
import { Roles } from "../../common/decorators";
import { UserRole } from "../../common/enums";
import {
  CreateEducationalStageDto,
  CreateExamDto,
  CreateLessonDto,
  CreateMonthDto,
  ReorderDto,
  UpdateEducationalStageDto,
  UpdateExamDto,
  UpdateLessonDto,
  UpdateMonthDto,
} from "./dto";

@Controller("educational-content")
export class EducationalContentController {
  constructor(
    private readonly educationalContentService: EducationalContentService,
  ) {}

  @Get("stages")
  async findAllStages() {
    return this.educationalContentService.findAllStages();
  }

  @Get("stages/:id")
  async findOneStage(@Param("id") id: string) {
    return this.educationalContentService.findOneStage(id);
  }

  @Post("stages")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createStage(@Body() createDto: CreateEducationalStageDto) {
    return this.educationalContentService.createStage(createDto);
  }

  @Patch("stages/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateStage(
    @Param("id") id: string,
    @Body() updateDto: UpdateEducationalStageDto,
  ) {
    return this.educationalContentService.updateStage(id, updateDto);
  }

  @Delete("stages/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async removeStage(@Param("id") id: string) {
    return this.educationalContentService.removeStage(id);
  }

  @Patch("stages/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async reorderStages(@Body() reorderDto: ReorderDto) {
    return this.educationalContentService.reorderStages(reorderDto);
  }

  @Get("months/stage/:stageId")
  @UseGuards(OptionalJwtAuthGuard)
  async findMonthsByStage(
    @Param("stageId") stageId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findMonthsByStage(stageId, userId);
  }

  @Get("months/:id")
  @UseGuards(OptionalJwtAuthGuard)
  async findOneMonth(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findOneMonth(id, userId);
  }

  @Post("months")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createMonth(@Body() createDto: CreateMonthDto) {
    return this.educationalContentService.createMonth(createDto);
  }

  @Patch("months/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateMonth(
    @Param("id") id: string,
    @Body() updateDto: UpdateMonthDto,
  ) {
    return this.educationalContentService.updateMonth(id, updateDto);
  }

  @Delete("months/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async removeMonth(@Param("id") id: string) {
    return this.educationalContentService.removeMonth(id);
  }

  @Patch("months/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async reorderMonths(@Body() reorderDto: ReorderDto) {
    return this.educationalContentService.reorderMonths(reorderDto);
  }

  @Get("lessons/month/:monthId")
  @UseGuards(OptionalJwtAuthGuard)
  async findLessonsByMonth(
    @Param("monthId") monthId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findLessonsByMonth(monthId, userId);
  }

  @Get("lessons/:id")
  @UseGuards(OptionalJwtAuthGuard)
  async findOneLesson(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findOneLesson(id, userId);
  }

  @Post("lessons")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createLesson(@Body() createDto: CreateLessonDto) {
    return this.educationalContentService.createLesson(createDto);
  }

  @Patch("lessons/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateLesson(
    @Param("id") id: string,
    @Body() updateDto: UpdateLessonDto,
  ) {
    return this.educationalContentService.updateLesson(id, updateDto);
  }

  @Delete("lessons/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async removeLesson(@Param("id") id: string) {
    return this.educationalContentService.removeLesson(id);
  }

  @Get("exams/month/:monthId")
  @UseGuards(OptionalJwtAuthGuard)
  async findExamsByMonth(
    @Param("monthId") monthId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findExamsByMonth(monthId, userId);
  }

  @Get("exams/:id")
  @UseGuards(OptionalJwtAuthGuard)
  async findOneExam(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as any)?.id;

    return this.educationalContentService.findOneExam(id, userId);
  }

  @Post("exams")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async createExam(@Body() createDto: CreateExamDto) {
    return this.educationalContentService.createExam(createDto);
  }

  @Patch("exams/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async updateExam(@Param("id") id: string, @Body() updateDto: UpdateExamDto) {
    return this.educationalContentService.updateExam(id, updateDto);
  }

  @Delete("exams/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async removeExam(@Param("id") id: string) {
    return this.educationalContentService.removeExam(id);
  }

  @Get("content/month/:monthId")
  @UseGuards(OptionalJwtAuthGuard)
  async findContentByMonth(
    @Param("monthId") monthId: string,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    return this.educationalContentService.findContentByMonth(monthId, userId);
  }

  @Patch("content/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async reorderContent(@Body() reorderDto: ReorderDto) {
    return this.educationalContentService.reorderContent(reorderDto);
  }

  @Get("stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getStats() {
    return this.educationalContentService.getStats();
  }
}
