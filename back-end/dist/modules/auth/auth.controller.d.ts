import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        userId: string;
        name: string;
        email: string;
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        user: {
            id: import("mongoose").Types.ObjectId;
            studentId: string;
            name: string;
            email: string;
            role: import("../../common/enums/user-role.enum.js").UserRole;
            status: import("../../common/enums/user-status.enum.js").UserStatus;
        };
        message: string;
    }>;
    login(loginDto: LoginDto, response: Response): Promise<{
        user: {
            id: string;
            studentId: string;
            name: string;
            email: string;
            phoneNumber: string;
            address: string;
            educationalStage: import("mongoose").Types.ObjectId | undefined;
            role: import("../../common/enums/user-role.enum.js").UserRole;
            status: import("../../common/enums/user-status.enum.js").UserStatus.ACTIVE;
        };
        accessToken: string;
    }>;
    refresh(request: Request): Promise<{
        accessToken: string;
    }>;
    logout(response: Response): {
        message: string;
    };
}
