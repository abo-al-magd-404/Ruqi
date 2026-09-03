import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IEducationalStage } from '../common/interfaces/educational-stage.interface.js';

export type EducationalStageDocument = HydratedDocument<EducationalStage>;

@Schema({ timestamps: true })
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
