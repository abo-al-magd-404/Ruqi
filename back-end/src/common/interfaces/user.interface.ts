import { Types } from 'mongoose';
import { UserRole } from '../enums/user-role.enum.js';
import { UserStatus } from '../enums/user-status.enum.js';

export interface IUser {
  _id?: Types.ObjectId;
  studentId?: string;
  avatar?: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;

  role: UserRole;
  status: UserStatus;

  stage?: Types.ObjectId;
  subscribedMonths: Types.ObjectId[];

  // OTP Fields
  emailOtp?: string | null;
  emailOtpExpiresAt?: Date | null;
  emailOtpLastSentAt?: Date | null;

  // Session Management
  hashedRefreshToken?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}
