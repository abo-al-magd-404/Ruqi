import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { generateUserId } from '../../common/utils/user-id.util.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createStudent(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    educationalStageId?: string;
  }): Promise<UserDocument> {
    const email = data.email.toLowerCase().trim();
    const existingUser = await this.userModel.findOne({ email }).lean().exec();
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = generateUserId();
    const user = new this.userModel({
      userId,
      email,
      password: hashedPassword,
      name: data.name.trim(),
      phoneNumber: data.phoneNumber.trim(),
      address: data.address.trim(),
      ...(data.educationalStageId && {
        educationalStage: data.educationalStageId,
      }),
      role: UserRole.STUDENT,
      status: UserStatus.PENDING,
    });
    return user.save();
  }

  async setEmailVerification(
    userId: string,
    data: {
      otpHash: string;
      expiresAt: Date;
      lastSentAt: Date;
    },
  ): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          $set: {
            emailVerification: data,
          },
        },
      )
      .exec();
  }

  async activateUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          status: UserStatus.ACTIVE,
        },
        $unset: {
          emailVerification: 1,
        },
      },
      {
        new: true,
      },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        email: email.toLowerCase().trim(),
      })
      .exec();
  }
}
