var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../schemas/user.schema.js';
import { MailService } from '../../common/services/mail.service.js';
import { generateOtp } from '../../common/utils/otp.util.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../common/services/token.service.js';
let AuthService = class AuthService {
    userModel;
    mailService;
    configService;
    tokenService;
    jwtService;
    constructor(userModel, mailService, configService, tokenService, jwtService) {
        this.userModel = userModel;
        this.mailService = mailService;
        this.configService = configService;
        this.tokenService = tokenService;
        this.jwtService = jwtService;
    }
    async signup(signupDto) {
        const { email, password, name, phoneNumber, address } = signupDto;
        const existingUser = await this.userModel.findOne({
            email: email.toLowerCase(),
        });
        if (existingUser) {
            throw new ConflictException('البريد الإلكتروني مُسجل بالفعل');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpiresInMinutes = this.configService.getOrThrow('emailVerification.otpExpiresIn');
        const now = new Date();
        const otpExpiresAt = new Date(now.getTime() + otpExpiresInMinutes * 1000);
        const newUser = await this.userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phoneNumber,
            address,
            status: UserStatus.PENDING,
            emailOtp: otp,
            emailOtpExpiresAt: otpExpiresAt,
            emailOtpLastSentAt: now,
        });
        try {
            await this.mailService.sendOtpEmail(newUser.email, otp);
        }
        catch (error) { }
        return {
            message: 'تم إنشاء الحساب بنجاح، يرجى التوجه للبريد الإلكتروني لتفعيل الحساب بواسطة رمز التحقق',
            email: newUser.email,
        };
    }
    async resendOtp(resendOtpDto) {
        const { email } = resendOtpDto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundException('الحساب غير موجود');
        }
        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('الحساب مفعل بالفعل، يمكنك تسجيل الدخول مباشرة');
        }
        const now = new Date();
        const cooldownSeconds = this.configService.getOrThrow('emailVerification.otpResendCooldown');
        if (user.emailOtpLastSentAt) {
            const timeSinceLastSent = (now.getTime() - new Date(user.emailOtpLastSentAt).getTime()) / 1000;
            if (timeSinceLastSent < cooldownSeconds) {
                const remainingSeconds = Math.ceil(cooldownSeconds - timeSinceLastSent);
                throw new BadRequestException(`يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة طلب رمز التحقق`);
            }
        }
        const otp = generateOtp();
        const otpExpiresInMinutes = this.configService.getOrThrow('emailVerification.otpExpiresIn');
        const otpExpiresAt = new Date(now.getTime() + otpExpiresInMinutes * 1000);
        user.emailOtp = otp;
        user.emailOtpExpiresAt = otpExpiresAt;
        user.emailOtpLastSentAt = now;
        await user.save();
        try {
            await this.mailService.sendOtpEmail(user.email, otp);
        }
        catch (error) { }
        return {
            message: 'تم إعادة إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني',
        };
    }
    async verifyAccount(verifyAccountDto) {
        const { email, otp } = verifyAccountDto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundException('الحساب غير موجود');
        }
        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('الحساب مفعل بالفعل، يمكنك تسجيل الدخول مباشرة');
        }
        if (!user.emailOtp || !user.emailOtpExpiresAt) {
            throw new BadRequestException('لم يتم طلب رمز تحقق لهذا الحساب أو تم استخدامه من قبل');
        }
        const now = new Date();
        if (now > user.emailOtpExpiresAt) {
            throw new BadRequestException('انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد');
        }
        if (user.emailOtp !== otp) {
            throw new BadRequestException('رمز التحقق غير صحيح');
        }
        user.status = UserStatus.ACTIVE;
        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpLastSentAt = null;
        await user.save();
        return {
            message: 'تم تفعيل الحساب بنجاح، يمكنك الآن تسجيل الدخول',
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
        if (user.status === UserStatus.PENDING) {
            throw new ForbiddenException('الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق');
        }
        if (user.status === UserStatus.SUSPENDED) {
            throw new ForbiddenException('تم تعطيل هذا الحساب، يرجى التواصل مع الدعم الفني');
        }
        const tokens = await this.tokenService.generateAuthTokens({
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        user.hashedRefreshToken = hashedRefreshToken;
        await user.save();
        return {
            message: 'تم تسجيل الدخول بنجاح',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
            },
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }
    async forgetPassword(forgetPasswordDto) {
        const { email } = forgetPasswordDto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundException('الحساب غير موجود');
        }
        const now = new Date();
        const cooldownSeconds = this.configService.getOrThrow('emailVerification.otpResendCooldown');
        if (user.emailOtpLastSentAt) {
            const timeSinceLastSent = (now.getTime() - new Date(user.emailOtpLastSentAt).getTime()) / 1000;
            if (timeSinceLastSent < cooldownSeconds) {
                const remainingSeconds = Math.ceil(cooldownSeconds - timeSinceLastSent);
                throw new BadRequestException(`يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة طلب رمز التحقق`);
            }
        }
        const otp = generateOtp();
        const otpExpiresInMinutes = this.configService.getOrThrow('emailVerification.otpExpiresIn');
        const otpExpiresAt = new Date(now.getTime() + otpExpiresInMinutes * 1000);
        user.emailOtp = otp;
        user.emailOtpExpiresAt = otpExpiresAt;
        user.emailOtpLastSentAt = now;
        await user.save();
        try {
            await this.mailService.sendOtpEmail(user.email, otp);
        }
        catch (error) { }
        return {
            message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        };
    }
    async resetPassword(resetPasswordDto) {
        const { email, otp, newPassword } = resetPasswordDto;
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new NotFoundException('الحساب غير موجود');
        }
        if (!user.emailOtp || !user.emailOtpExpiresAt) {
            throw new BadRequestException('لم يتم طلب رمز إعادة تعيين كلمة المرور لهذا الحساب');
        }
        const now = new Date();
        if (now > user.emailOtpExpiresAt) {
            throw new BadRequestException('انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد');
        }
        if (user.emailOtp !== otp) {
            throw new BadRequestException('رمز التحقق غير صحيح');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.emailOtp = null;
        user.emailOtpExpiresAt = null;
        user.emailOtpLastSentAt = null;
        user.hashedRefreshToken = null;
        await user.save();
        return {
            message: 'تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول',
        };
    }
    async getNewAccessToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        let payload;
        try {
            const refreshSecret = this.configService.getOrThrow('jwt.refresh.secret');
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: refreshSecret,
            });
        }
        catch (error) {
            throw new UnauthorizedException('الـ Refresh Token غير صالح أو انتهت صلاحيته');
        }
        const user = await this.userModel.findById(payload.sub);
        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException('تم إلغاء الجلسة، يرجى تسجيل الدخول مجدداً');
        }
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!isRefreshTokenMatching) {
            throw new UnauthorizedException('الـ Refresh Token غير صالح');
        }
        const tokens = await this.tokenService.generateAuthTokens({
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
        user.hashedRefreshToken = newHashedRefreshToken;
        await user.save();
        return {
            message: 'تم تجديد الـ Access Token بنجاح',
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }
    async logout(userId) {
        await this.userModel.findByIdAndUpdate(userId, {
            hashedRefreshToken: null,
        });
        return {
            message: 'تم تسجيل الخروج بنجاح',
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model,
        MailService,
        ConfigService,
        TokenService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map