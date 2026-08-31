import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema.js';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getMyProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt');

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      message: 'تم جلب بيانات الحساب بنجاح',
      user,
    };
  }

  async updateStudentProfile(
    userId: string,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    const updateData: Record<string, any> = { ...updateStudentProfileDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { returnDocument: 'after', runValidators: true },
      )
      .select(
        '-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt',
      )
      .lean();

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      message: 'تم تحديث بيانات حساب الطالب بنجاح',
      user: updatedUser,
    };
  }
}
