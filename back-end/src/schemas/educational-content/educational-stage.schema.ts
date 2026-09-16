import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Collection, HydratedDocument } from "mongoose";
import { IEducationalStage } from "../../common/interfaces";

export type EducationalStageDocument = HydratedDocument<EducationalStage>;

@Schema({ timestamps: true, collection: "EducationalStages" })
export class EducationalStage implements IEducationalStage {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: null })
  image?: string | null;

  @Prop({ required: true, default: 0 })
  order: number;
}

export const EducationalStageSchema =
  SchemaFactory.createForClass(EducationalStage);
