import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  EducationalStage,
  EducationalStageSchema,
  Exam,
  ExamSchema,
  Lesson,
  LessonSchema,
  Month,
  MonthSchema,
  User,
  UserSchema,
} from "../../schemas";
import { EducationalContentController } from "./educational-content.controller";
import { EducationalContentService } from "./educational-content.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EducationalStage.name, schema: EducationalStageSchema },
      { name: Month.name, schema: MonthSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EducationalContentController],
  providers: [EducationalContentService],
  exports: [EducationalContentService],
})
export class EducationalContentModule {}
