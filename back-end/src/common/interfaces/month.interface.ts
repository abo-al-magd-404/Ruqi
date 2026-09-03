import { Document, Types } from 'mongoose';

export interface IMonth {
  title: string;
  description: string;
  image?: string | null;
  price: number;
  stage: Types.ObjectId;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMonthDocument extends IMonth, Document {}
