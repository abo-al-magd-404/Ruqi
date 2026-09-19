import bcrypt from "bcrypt";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateStudentProfileDto } from "./dto";
import { User, UserDocument } from "../../schemas";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // 1. Retrieve the authenticated user's profile
  async getMyProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select("-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt");

    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    return {
      message: "تم جلب بيانات الحساب بنجاح",
      user,
    };
  }

  // 2. Update the authenticated student's profile
  async updateStudentProfile(
    userId: string,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    const existingUser = await this.userModel.findById(userId);
    if (!existingUser) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    const updateData: Record<string, any> = { ...updateStudentProfileDto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
      )
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .lean();

    return {
      message: "تم تحديث بيانات حساب الطالب بنجاح",
      user: updatedUser,
    };
  }
}
