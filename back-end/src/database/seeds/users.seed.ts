import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/users/schemas/user.schema.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { generateUserId } from '../../common/utils/user-id.util.js';

@Injectable()
export class UsersSeed implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdmin();
    await this.seedTeacher();
  }

  private async seedAdmin(): Promise<void> {
    const email = this.configService
      .getOrThrow<string>('seed.admin.email')
      .toLowerCase()
      .trim();
    const existingUser = await this.userModel.exists({
      email,
      role: UserRole.ADMINISTRATOR,
    });
    if (existingUser) {
      return;
    }
    const password = this.configService.getOrThrow<string>(
      'seed.admin.password',
    );
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      userId: generateUserId(),
      email,
      password: hashedPassword,
      name: this.configService.getOrThrow<string>('seed.admin.name'),
      phoneNumber: this.configService.getOrThrow<string>(
        'seed.admin.phoneNumber',
      ),
      address: this.configService.getOrThrow<string>('seed.admin.address'),
      role: UserRole.ADMINISTRATOR,
      status: UserStatus.ACTIVE,
    });
    await user.save();
    console.log(`Admin user created: ${email}`);
  }

  private async seedTeacher(): Promise<void> {
    const email = this.configService
      .getOrThrow<string>('seed.teacher.email')
      .toLowerCase()
      .trim();
    const existingUser = await this.userModel.exists({
      email,
      role: UserRole.TEACHER,
    });
    if (existingUser) {
      return;
    }
    const password = this.configService.getOrThrow<string>(
      'seed.teacher.password',
    );
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      userId: generateUserId(),
      email,
      password: hashedPassword,
      name: this.configService.getOrThrow<string>('seed.teacher.name'),
      phoneNumber: this.configService.getOrThrow<string>(
        'seed.teacher.phoneNumber',
      ),
      address: this.configService.getOrThrow<string>('seed.teacher.address'),
      role: UserRole.TEACHER,
      status: UserStatus.ACTIVE,
    });
    await user.save();
    console.log(`Teacher user created: ${email}`);
  }
}
