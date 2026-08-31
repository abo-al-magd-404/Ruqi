import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { VerifyAccountDto } from './dto/verify-account.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgetPasswordDto } from './dto/forget-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(req: any): Promise<{
        message: string;
    }>;
}
