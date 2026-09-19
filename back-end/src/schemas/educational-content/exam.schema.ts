import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IExam } from "../../common/interfaces";
import { ContentType } from "../../common/enums";
import { Month } from "./month.schema";
import { Question, QuestionSchema } from "./question.schema";

export type ExamDocument = HydratedDocument<Exam>;

@Schema({ timestamps: true, collection: "Exams" })
export class Exam implements IExam {
  @Prop({ required: true, enum: ContentType })
  type: ContentType.EXAM;

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

  @Prop({ type: [QuestionSchema], required: true, default: [] })
  examQuestions: Question[];

  @Prop({ type: Number, required: true, default: 50 })
  passPercentage: number;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
