import { Controller, Get, Param } from "@nestjs/common";
import { Types } from "mongoose";
import { LeaderboardService } from "./leaderboard.service";
import { ParseMongoIdPipe } from "../../common/pipes";

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get("stages")
  async getEducationalStages() {
    return this.leaderboardService.getEducationalStages();
  }

  @Get("top-students")
  async getTopStudents() {
    return this.leaderboardService.getTopStudents();
  }

  @Get("stages/:stageId/top-students")
  async getTopStudentsByStage(
    @Param("stageId", ParseMongoIdPipe) stageId: string,
  ) {
    return this.leaderboardService.getTopStudentsByStage(
      new Types.ObjectId(stageId),
    );
  }
}
