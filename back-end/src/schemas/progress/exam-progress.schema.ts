import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IExamProgress } from "../../common/interfaces";
import { User } from "../user.schema";
import { Exam } from "../educational-content";

export type ExamProgressDocument = HydratedDocument<ExamProgress>;

@Schema({ timestamps: true, collection: "ExamsProgresses" })
export class ExamProgress implements IExamProgress {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  student: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Exam.name,
    required: true,
  })
  exam: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  correctAnswers: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalQuestions: number;

  @Prop({ type: Number, default: 0, min: 0 })
  points: number;

  @Prop({ type: Number, default: 0, min: 0 })
  bonusPoints: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPoints: number;

  @Prop({ type: Boolean, default: false })
  passed: boolean;
}

export const ExamProgressSchema = SchemaFactory.createForClass(ExamProgress);

ExamProgressSchema.index({ student: 1, exam: 1 }, { unique: true });
