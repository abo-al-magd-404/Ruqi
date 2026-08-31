import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../schemas/user.schema.js';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../common/enums/user-role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedTeacher();
  }

  private async seedAdmin() {
    const adminEmail =
      this.configService.getOrThrow<string>('SEED_ADMIN_EMAIL');
    const existingAdmin = await this.userModel.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (!existingAdmin) {
      const plainPassword = this.configService.getOrThrow<string>(
        'SEED_ADMIN_PASSWORD',
      );
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await this.userModel.create({
        name: this.configService.getOrThrow<string>('SEED_ADMIN_NAME'),
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        phoneNumber: this.configService.getOrThrow<string>('SEED_ADMIN_PHONE'),
        address: this.configService.getOrThrow<string>('SEED_ADMIN_ADDRESS'),
      });

      this.logger.log('✅ Default Admin account created successfully.');
    }
  }

  private async seedTeacher() {
    const teacherEmail =
      this.configService.getOrThrow<string>('SEED_TEACHER_EMAIL');
    const existingTeacher = await this.userModel.findOne({
      email: teacherEmail.toLowerCase(),
    });

    if (!existingTeacher) {
      const plainPassword = this.configService.getOrThrow<string>(
        'SEED_TEACHER_PASSWORD',
      );
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await this.userModel.create({
        name: this.configService.getOrThrow<string>('SEED_TEACHER_NAME'),
        email: teacherEmail.toLowerCase(),
        password: hashedPassword,
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        phoneNumber:
          this.configService.getOrThrow<string>('SEED_TEACHER_PHONE'),
        address: this.configService.getOrThrow<string>('SEED_TEACHER_ADDRESS'),
      });

      this.logger.log('✅ Default Teacher account created successfully.');
    }
  }
}
