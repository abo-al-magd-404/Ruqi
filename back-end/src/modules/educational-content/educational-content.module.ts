import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationalContentController } from './educational-content.controller.js';
import { EducationalContentService } from './educational-content.service.js';
import {
  EducationalStage,
  EducationalStageSchema,
} from '../../schemas/educational-stage.schema.js';
import { Month, MonthSchema } from '../../schemas/month.schema.js';
import {
  LessonExam,
  LessonExamSchema,
} from '../../schemas/lesson-exam.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EducationalStage.name, schema: EducationalStageSchema },
      { name: Month.name, schema: MonthSchema },
      { name: LessonExam.name, schema: LessonExamSchema },
    ]),
  ],
  controllers: [EducationalContentController],
  providers: [EducationalContentService],
  exports: [EducationalContentService],
})
export class EducationalContentModule {}
