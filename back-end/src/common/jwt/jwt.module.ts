import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppJwtService } from './app-jwt.service.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    JwtModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  providers: [AppJwtService, JwtStrategy],
  exports: [AppJwtService, PassportModule],
})
export class AppJwtModule {}
