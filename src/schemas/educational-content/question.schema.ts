import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IQuestion } from "../../common";

@Schema({ _id: false })
export class Question implements IQuestion {
  @Prop({ required: true, trim: true })
  questionText: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: [Number], required: true })
  correctAnswers: number[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
