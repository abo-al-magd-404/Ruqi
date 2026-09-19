import { Types } from "mongoose";

export interface ILessonProgress {
  _id?: Types.ObjectId;

  student: Types.ObjectId;
  lesson: Types.ObjectId;

  videoCompleted: boolean;
  explanationCompleted: boolean;
  homeworkCompleted: boolean;
  bookCompleted: boolean;

  videoPoints: number;
  explanationPoints: number;
  homeworkPoints: number;

  totalPoints: number;

  completed: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
