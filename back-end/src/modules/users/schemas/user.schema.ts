import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../../../common/enums/user-role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  phoneNumber: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  address: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'EducationalStage',
    required: false,
  })
  educationalStage?: Types.ObjectId;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    required: true,
  })
  status: UserStatus;

  @Prop({
    type: {
      otpHash: {
        type: String,
        required: false,
      },
      expiresAt: {
        type: Date,
        required: false,
      },
      lastSentAt: {
        type: Date,
        required: false,
      },
    },
    required: false,
  })
  emailVerification?: {
    otpHash?: string;
    expiresAt?: Date;
    lastSentAt?: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
