import { Types } from "mongoose";
import { ContentType } from "../../enums";
import { IQuestion } from "./question.interface";

export interface ILesson {
  type: ContentType.LESSON;
  title: string;
  description: string;
  image?: string | null;
  month: Types.ObjectId;
  order: number;

  videoUrl: string;
  writtenExplanation: string;
  homework: IQuestion[];
  note?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonDocument extends ILesson, Document {}
