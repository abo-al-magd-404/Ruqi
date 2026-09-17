import { Types } from "mongoose";

export interface IExamProgress {
  _id?: Types.ObjectId;

  student: Types.ObjectId;
  exam: Types.ObjectId;

  correctAnswers: number;
  totalQuestions: number;

  points: number;
  bonusPoints: number;
  totalPoints: number;

  passed: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
