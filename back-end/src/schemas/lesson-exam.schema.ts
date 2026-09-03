import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Month } from './month.schema.js';
import {
  ILessonExam,
  IQuestion,
} from '../common/interfaces/lesson-exam.interface.js';
import { ContentType } from '../common/enums/content-type.enum.js';

export type LessonExamDocument = HydratedDocument<LessonExam>;

@Schema({ _id: false })
class Question implements IQuestion {
  @Prop({ required: true, trim: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [Number], required: true })
  correctAnswers: number[];
}

const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class LessonExam implements ILessonExam {
  @Prop({ required: true, enum: ContentType })
  type: ContentType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: String, default: null })
  image?: string | null;

  @Prop({ type: Types.ObjectId, ref: Month.name, required: true })
  month: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ type: String })
  videoUrl?: string;

  @Prop({ type: String })
  writtenExplanation?: string;

  @Prop({ type: [QuestionSchema], default: [] })
  homework?: Question[];

  @Prop({ type: [QuestionSchema], default: [] })
  examQuestions?: Question[];

  @Prop({ type: Number, default: 50 })
  passPercentage?: number;
}

export const LessonExamSchema = SchemaFactory.createForClass(LessonExam);
