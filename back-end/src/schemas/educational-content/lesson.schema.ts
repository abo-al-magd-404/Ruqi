import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ILesson } from "../../common/interfaces";
import { ContentType } from "../../common/enums";
import { Month } from "./month.schema";
import { Question, QuestionSchema } from "./question.schema";

export type LessonDocument = HydratedDocument<Lesson>;

@Schema({ timestamps: true, collection: "Lessons" })
export class Lesson implements ILesson {
  @Prop({ required: true, enum: ContentType, default: ContentType.LESSON })
  type: ContentType.LESSON;

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

  @Prop({ required: true, trim: true })
  videoUrl: string;

  @Prop({ required: true, trim: true })
  writtenExplanation: string;

  @Prop({ type: [QuestionSchema], default: [] })
  homework: Question[];

  @Prop({ type: String, default: null })
  note?: string | null;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
