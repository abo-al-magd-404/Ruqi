import { Module } from "@nestjs/common";
import { LeaderboardService } from "./leaderboard.service";
import { LeaderboardController } from "./leaderboard.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  EducationalStage,
  EducationalStageSchema,
  ExamProgress,
  ExamProgressSchema,
  LessonProgress,
  LessonProgressSchema,
  User,
  UserSchema,
} from "../../schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: LessonProgress.name,
        schema: LessonProgressSchema,
      },
      {
        name: ExamProgress.name,
        schema: ExamProgressSchema,
      },
      {
        name: EducationalStage.name,
        schema: EducationalStageSchema,
      },
    ]),
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
