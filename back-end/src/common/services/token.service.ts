import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAuthTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessSecret =
      this.configService.getOrThrow<string>('jwt.access.secret');
    const accessExpiresIn = this.configService.getOrThrow<number>(
      'jwt.access.expiresIn',
    );

    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refresh.secret');
    const refreshExpiresIn = this.configService.getOrThrow<number>(
      'jwt.refresh.expiresIn',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
