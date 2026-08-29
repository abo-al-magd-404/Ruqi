import { Module } from '@nestjs/common';
import { UsersModule } from '../modules/users/users.module.js';
import { UsersSeed } from './seeds/users.seed.js';

@Module({
  imports: [UsersModule],
  providers: [UsersSeed],
})
export class DatabaseModule {}
