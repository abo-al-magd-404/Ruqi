import { Document } from 'mongoose';

export interface IEducationalStage {
  title: string;
  image?: string | null;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEducationalStageDocument
  extends IEducationalStage, Document {}
