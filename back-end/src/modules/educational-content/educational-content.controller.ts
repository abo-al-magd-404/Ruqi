import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EducationalContentService } from './educational-content.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { ParseMongoIdPipe as MongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe.js';
import {
  CreateEducationalStageDto,
  UpdateEducationalStageDto,
} from './dto/educational-stage.dto.js';
import { ReorderDto } from './dto/reorder.dto.js';
import { CreateMonthDto, UpdateMonthDto } from './dto/month.dto.js';
import {
  CreateExamDto,
  CreateLessonDto,
  UpdateLessonExamDto,
} from './dto/lesson-exam.dto.js';

@Controller('educational-content')
export class EducationalContentController {
  constructor(
    private readonly educationalContentService: EducationalContentService,
  ) {}

  // ================================================== //
  // =============== EDUCATIONAL STAGES =============== //
  // ================================================== //

  // --- PUBLIC / STUDENT APIs ---
  @Get('stages')
  async findAllStages() {
    return await this.educationalContentService.findAllStages();
  }

  @Get('stages/:id')
  async findOneStage(@Param('id', MongoIdPipe) id: string) {
    return await this.educationalContentService.findOneStage(id);
  }

  // --- TEACHER ONLY APIs ---
  @Post('stages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createStage(@Body() createDto: CreateEducationalStageDto) {
    return await this.educationalContentService.createStage(createDto);
  }

  @Patch('stages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStage(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateDto: UpdateEducationalStageDto,
  ) {
    return await this.educationalContentService.updateStage(id, updateDto);
  }

  @Delete('stages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeStage(@Param('id', MongoIdPipe) id: string) {
    await this.educationalContentService.removeStage(id);
    return { message: 'تم حذف المرحلة الدراسية بنجاح' };
  }

  // ================================================== //
  // =============== EDUCATIONAL MONTHS =============== //
  // ================================================== //

  // --- PUBLIC / STUDENT APIs ---
  @Get('months/stage/:stageId')
  async findMonthsByStage(@Param('stageId', MongoIdPipe) stageId: string) {
    return await this.educationalContentService.findMonthsByStage(stageId);
  }

  @Get('months/:id')
  async findOneMonth(@Param('id', MongoIdPipe) id: string) {
    return await this.educationalContentService.findOneMonth(id);
  }

  // --- TEACHER ONLY APIs ---
  @Post('months')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createMonth(@Body() createDto: CreateMonthDto) {
    return await this.educationalContentService.createMonth(createDto);
  }

  @Patch('months/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reorderMonths(@Body() reorderDto: ReorderDto) {
    await this.educationalContentService.reorderMonths(reorderDto);
    return { message: 'تم إعادة ترتيب الشهور بنجاح' };
  }

  @Patch('months/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateMonth(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateDto: UpdateMonthDto,
  ) {
    return await this.educationalContentService.updateMonth(id, updateDto);
  }

  @Delete('months/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeMonth(@Param('id', MongoIdPipe) id: string) {
    await this.educationalContentService.removeMonth(id);
    return { message: 'تم حذف الشهر بنجاح' };
  }

  // ================================================== //
  // =============== LESSONS AND EXAMS ================ //
  // ================================================== //

  // --- PUBLIC / STUDENT APIs ---
  @Get('content/month/:monthId')
  async findContentByMonth(@Param('monthId', MongoIdPipe) monthId: string) {
    return await this.educationalContentService.findContentByMonth(monthId);
  }

  @Get('content/:id')
  async findOneContent(@Param('id', MongoIdPipe) id: string) {
    return await this.educationalContentService.findOneContent(id);
  }

  // --- TEACHER ONLY APIs ---
  @Post('lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createLesson(@Body() createDto: CreateLessonDto) {
    return await this.educationalContentService.createLesson(createDto);
  }

  @Post('exams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createExam(@Body() createDto: CreateExamDto) {
    return await this.educationalContentService.createExam(createDto);
  }

  @Patch('content/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reorderContent(@Body() reorderDto: ReorderDto) {
    await this.educationalContentService.reorderContent(reorderDto);
    return { message: 'تم إعادة ترتيب المحتوى بنجاح' };
  }

  @Patch('content/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateContent(
    @Param('id', MongoIdPipe) id: string,
    @Body() updateDto: UpdateLessonExamDto,
  ) {
    return await this.educationalContentService.updateContent(id, updateDto);
  }

  @Delete('content/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeContent(@Param('id', MongoIdPipe) id: string) {
    await this.educationalContentService.removeContent(id);
    return { message: 'تم حذف المحتوى بنجاح' };
  }
}
