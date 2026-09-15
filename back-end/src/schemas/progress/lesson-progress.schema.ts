import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ILessonProgress } from "../../common";
import { User } from "../user.schema";
import { Lesson } from "../educational-content";

export type LessonProgressDocument = HydratedDocument<LessonProgress>;

@Schema({ timestamps: true, collection: "LessonsProgresses" })
export class LessonProgress implements ILessonProgress {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
  })
  student: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Lesson.name,
    required: true,
  })
  lesson: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  videoCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  explanationCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  homeworkCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  bookCompleted: boolean;

  @Prop({ type: Number, default: 0, min: 0 })
  videoPoints: number;

  @Prop({ type: Number, default: 0, min: 0 })
  explanationPoints: number;

  @Prop({ type: Number, default: 0, min: 0 })
  homeworkPoints: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalPoints: number;

  @Prop({ type: Boolean, default: false })
  completed: boolean;
}

export const LessonProgressSchema =
  SchemaFactory.createForClass(LessonProgress);

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
