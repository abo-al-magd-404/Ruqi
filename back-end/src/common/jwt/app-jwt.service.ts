import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../enums/user-role.enum.js';

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

@Injectable()
export class AppJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.getOrThrow<string>('jwt.access.secret');
    const expiresIn = this.configService.getOrThrow<number>(
      'jwt.access.expiresIn',
    );
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.getOrThrow<string>('jwt.refresh.secret');
    const expiresIn = this.configService.getOrThrow<number>(
      'jwt.refresh.expiresIn',
    );
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const secret = this.configService.getOrThrow<string>('jwt.refresh.secret');
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret,
    });
  }
}
