import { Module } from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { ProgressController } from "./progress.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Exam,
  ExamProgress,
  ExamProgressSchema,
  ExamSchema,
  Lesson,
  LessonProgress,
  LessonProgressSchema,
  LessonSchema,
} from "../../schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LessonProgress.name,
        schema: LessonProgressSchema,
      },
      {
        name: ExamProgress.name,
        schema: ExamProgressSchema,
      },
      {
        name: Lesson.name,
        schema: LessonSchema,
      },
      {
        name: Exam.name,
        schema: ExamSchema,
      },
    ]),
  ],

  controllers: [ProgressController],

  providers: [ProgressService],
})
export class ProgressModule {}
