import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../schemas/user.schema.js';
import { SignupDto } from './dto/signup.dto.js';
import { MailService } from '../../common/services/mail.service.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { VerifyAccountDto } from './dto/verify-account.dto.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { TokenService } from '../../common/services/token.service.js';
import { ForgetPasswordDto } from './dto/forget-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthService {
    private readonly userModel;
    private readonly mailService;
    private readonly configService;
    private readonly tokenService;
    private readonly jwtService;
    constructor(userModel: Model<UserDocument>, mailService: MailService, configService: ConfigService, tokenService: TokenService, jwtService: JwtService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        email: string;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    verifyAccount(verifyAccountDto: VerifyAccountDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            role: import("../../common/enums/user-role.enum.js").UserRole;
            studentId: string | undefined;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    forgetPassword(forgetPasswordDto: ForgetPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getNewAccessToken(refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
