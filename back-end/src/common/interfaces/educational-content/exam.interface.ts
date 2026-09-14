import { Types } from "mongoose";
import { ContentType } from "../../enums";
import { IQuestion } from "./question.interface";

export interface IExam {
  _id: Types.ObjectId;
  type: ContentType.EXAM;
  title: string;
  description: string;
  image?: string | null;
  month: Types.ObjectId;
  order: number;

  examQuestions: IQuestion[];
  passPercentage: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExamDocument extends IExam, Document {}
