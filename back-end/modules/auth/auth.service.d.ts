import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { MailService } from '../../common/mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { LoginDto } from './dto/login.dto.js';
import { AppJwtService } from '../../common/jwt/app-jwt.service.js';
export declare class AuthService {
    private readonly usersService;
    private readonly mailService;
    private readonly configService;
    private readonly appJwtService;
    constructor(usersService: UsersService, mailService: MailService, configService: ConfigService, appJwtService: AppJwtService);
    register(registerDto: RegisterDto): Promise<{
        userId: string;
        name: string;
        email: string;
        message: string;
    }>;
    private parseDuration;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            studentId: string;
            name: string;
            email: string;
            role: import("../../common/enums/user-role.enum.js").UserRole;
            status: UserStatus;
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            studentId: string;
            name: string;
            email: string;
            phoneNumber: string;
            address: string;
            educationalStage: import("mongoose").Types.ObjectId | undefined;
            role: import("../../common/enums/user-role.enum.js").UserRole;
            status: UserStatus.ACTIVE;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
