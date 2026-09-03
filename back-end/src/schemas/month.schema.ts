import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EducationalStage } from './educational-stage.schema.js';
import { IMonth } from '../common/interfaces/month.interface.js';

export type MonthDocument = HydratedDocument<Month>;

@Schema({ timestamps: true })
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
