import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  User,
  UserDocument,
  LessonProgress,
  LessonProgressDocument,
  ExamProgress,
  ExamProgressDocument,
  EducationalStage,
  EducationalStageDocument,
} from "../../schemas";
import { UserRole, UserStatus } from "../../common/enums";

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,

    @InjectModel(ExamProgress.name)
    private readonly examProgressModel: Model<ExamProgressDocument>,

    @InjectModel(EducationalStage.name)
    private readonly educationalStageModel: Model<EducationalStageDocument>,
  ) {}

  async getEducationalStages() {
    const stages = await this.educationalStageModel
      .find()
      .select("title")
      .sort({ order: 1 })
      .lean();

    return {
      data: stages,
    };
  }

  async getTopStudents() {
    const students = await this.userModel
      .find({
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      })
      .select("_id studentId name avatar stage")
      .lean();

    const [lessonPoints, examPoints] = await Promise.all([
      this.lessonProgressModel.aggregate([
        {
          $group: {
            _id: "$student",
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]),

      this.examProgressModel.aggregate([
        {
          $group: {
            _id: "$student",
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]),
    ]);

    const pointsMap = new Map<string, number>();

    for (const progress of lessonPoints) {
      const studentId = progress._id.toString();

      pointsMap.set(
        studentId,
        (pointsMap.get(studentId) ?? 0) + progress.totalPoints,
      );
    }

    for (const progress of examPoints) {
      const studentId = progress._id.toString();

      pointsMap.set(
        studentId,
        (pointsMap.get(studentId) ?? 0) + progress.totalPoints,
      );
    }

    const stages = await this.educationalStageModel
      .find()
      .select("_id title")
      .lean();

    const stageMap = new Map(
      stages.map((stage) => [stage._id.toString(), stage.title]),
    );

    const leaderboard = students
      .map((student) => ({
        studentId: student.studentId,
        name: student.name,
        avatar: student.avatar,
        stage: student.stage
          ? (stageMap.get(student.stage.toString()) ?? null)
          : null,
        totalPoints: pointsMap.get(student._id.toString()) ?? 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((student, index) => ({
        rank: index + 1,
        ...student,
      }));

    return {
      data: leaderboard,
    };
  }

  async getTopStudentsByStage(stageId: Types.ObjectId) {
    const stage = await this.educationalStageModel
      .findById(stageId)
      .select("_id title")
      .lean();

    if (!stage) {
      throw new NotFoundException("المرحلة التعليمية غير موجودة");
    }

    const students = await this.userModel
      .find({
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        stage: stageId,
      })
      .select("_id studentId name avatar")
      .lean();

    const studentIds = students.map((student) => student._id);

    const [lessonPoints, examPoints] = await Promise.all([
      this.lessonProgressModel.aggregate([
        {
          $match: {
            student: { $in: studentIds },
          },
        },
        {
          $group: {
            _id: "$student",
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]),

      this.examProgressModel.aggregate([
        {
          $match: {
            student: { $in: studentIds },
          },
        },
        {
          $group: {
            _id: "$student",
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]),
    ]);

    const pointsMap = new Map<string, number>();

    for (const progress of lessonPoints) {
      const studentId = progress._id.toString();

      pointsMap.set(
        studentId,
        (pointsMap.get(studentId) ?? 0) + progress.totalPoints,
      );
    }

    for (const progress of examPoints) {
      const studentId = progress._id.toString();

      pointsMap.set(
        studentId,
        (pointsMap.get(studentId) ?? 0) + progress.totalPoints,
      );
    }

    const leaderboard = students
      .map((student) => ({
        studentId: student.studentId,
        name: student.name,
        avatar: student.avatar,
        totalPoints: pointsMap.get(student._id.toString()) ?? 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((student, index) => ({
        rank: index + 1,
        ...student,
      }));

    return {
      data: {
        stage: stage.title,
        students: leaderboard,
      },
    };
  }
}
