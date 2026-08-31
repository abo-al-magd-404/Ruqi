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
export declare class TokenService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateAuthTokens(payload: TokenPayload): Promise<AuthTokens>;
}
