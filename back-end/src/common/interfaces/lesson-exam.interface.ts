import { Document, Types } from 'mongoose';
import { ContentType } from '../enums/content-type.enum.js';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswers: number[];
}

export interface ILessonExam {
  type: ContentType;
  title: string;
  description: string;
  image?: string | null;
  month: Types.ObjectId;
  order: number;

  videoUrl?: string;
  writtenExplanation?: string;
  homework?: IQuestion[];

  examQuestions?: IQuestion[];
  passPercentage?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonExamDocument extends ILessonExam, Document {}
