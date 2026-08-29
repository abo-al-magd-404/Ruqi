import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { MailModule } from '../../common/mail/mail.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AppJwtModule } from '../../common/jwt/jwt.module.js';

@Module({
  imports: [UsersModule, MailModule, AppJwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
