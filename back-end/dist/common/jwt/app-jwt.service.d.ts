import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../enums/user-role.enum.js';
export interface JwtPayload {
    sub: string;
    role: UserRole;
}
export declare class AppJwtService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    generateAccessToken(payload: JwtPayload): Promise<string>;
    generateRefreshToken(payload: JwtPayload): Promise<string>;
    verifyRefreshToken(token: string): Promise<JwtPayload>;
}
