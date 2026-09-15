import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IMonth } from "../../common";
import { EducationalStage } from "./educational-stage.schema";

export type MonthDocument = HydratedDocument<Month>;

@Schema({ timestamps: true, collection: "Months" })
export class Month implements IMonth {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: String, default: null })
  image?: string | null;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ type: Types.ObjectId, ref: EducationalStage.name, required: true })
  stage: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  order: number;
}

export const MonthSchema = SchemaFactory.createForClass(Month);
