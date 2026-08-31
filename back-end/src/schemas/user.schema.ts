import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../common/enums/user-role.enum.js';
import { UserStatus } from '../common/enums/user-status.enum.js';
import { IUser } from '../common/interfaces/user.interface.js';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'Users' })
export class User implements IUser {
  @Prop({ unique: true, sparse: true, trim: true })
  studentId?: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, trim: true })
  phoneNumber!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.PENDING })
  status!: UserStatus;

  @Prop({ type: String, required: false })
  educationalStage?: string;

  // OTP Fields
  @Prop({ type: String, default: null })
  emailOtp?: string | null;

  @Prop({ type: Date, default: null })
  emailOtpExpiresAt?: Date | null;

  @Prop({ type: Date, default: null })
  emailOtpLastSentAt?: Date | null;

  // Session Management
  @Prop({ type: String, default: null })
  hashedRefreshToken?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
