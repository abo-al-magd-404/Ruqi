var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { MailService } from '../../common/mail/mail.service.js';
import { generateOtp } from '../../common/utils/otp.util.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
let AuthService = class AuthService {
    usersService;
    mailService;
    configService;
    constructor(usersService, mailService, configService) {
        this.usersService = usersService;
        this.mailService = mailService;
        this.configService = configService;
    }
    async register(registerDto) {
        const user = await this.usersService.createStudent({
            name: registerDto.name,
            email: registerDto.email,
            password: registerDto.password,
            phoneNumber: registerDto.phoneNumber,
            address: registerDto.address,
            educationalStageId: registerDto.educationalStageId,
        });
        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const now = new Date();
        const otpExpiresIn = this.configService.getOrThrow('emailVerification.otpExpiresIn');
        const expiresAt = new Date(now.getTime() + this.parseDuration(otpExpiresIn));
        await this.usersService.setEmailVerification(user._id.toString(), {
            otpHash,
            expiresAt,
            lastSentAt: now,
        });
        await this.mailService.sendMail({
            to: user.email,
            subject: 'RUQI Email Verification',
            html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>تأكيد البريد الإلكتروني</title>
        <style>
          @media only screen and (max-width: 480px) {
            .email-container { width: 100% !important; }
            .email-body { padding: 28px 20px !important; }
            .otp-box { padding: 12px 24px !important; }
            .otp-text { font-size: 26px !important; letter-spacing: 5px !important; }
            .header-cell { padding: 22px 20px !important; }
          }
        </style>
        </head>
        <body style="margin:0; padding:0; background-color:#f8f7f4;">
          <div style="margin:0; padding:0; background-color:#f8f7f4; font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f7f4; padding: 32px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width:480px; background-color:#ffffff; border-radius:16px; border:1px solid #e2ddd5; overflow:hidden; box-shadow:0 4px 16px rgba(45,41,38,0.06);">

                    <!-- Header -->
                    <tr>
                      <td class="header-cell" style="background-color:#1c1712; padding:28px 32px; text-align:center;">
                        <span style="font-size:22px; font-weight:700; color:#e8e2d8; letter-spacing:0.5px;">رُقِيّ</span>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td class="email-body" style="padding: 40px 36px 32px;">
                        <h2 style="margin:0 0 12px; font-size:20px; color:#2d2926; text-align:center;">
                          تأكيد البريد الإلكتروني
                        </h2>
                        <p style="margin:0 0 28px; font-size:14px; color:#736c65; text-align:center; line-height:1.7;">
                          كود التحقق الخاص بحسابك على منصة رقي هو:
                        </p>

                        <!-- OTP Box -->
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <div class="otp-box" style="display:inline-block; background-color:#faf5ea; border:1px solid #e8d8b5; border-radius:12px; padding:16px 40px;">
                                <span class="otp-text" style="font-size:32px; font-weight:700; color:#c49a45; letter-spacing:8px; direction:ltr; display:inline-block;">
                                  ${otp}
                                </span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:28px 0 0; font-size:13px; color:#736c65; text-align:center; line-height:1.7;">
                          هذا الكود صالح لمدة <strong style="color:#2d2926;">${otpExpiresIn}</strong>. لا تشارك هذا الكود مع أي شخص.
                        </p>
                      </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                      <td style="padding: 0 36px;">
                        <div style="border-top:1px solid #e2ddd5;"></div>
                      </td>
                    </tr>

                    <!-- Footer note -->
                    <tr>
                      <td style="padding: 20px 36px 28px; text-align:center;">
                        <p style="margin:0; font-size:12px; color:#a39c90;">
                          إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة بأمان.
                        </p>
                      </td>
                    </tr>

                  </table>

                  <p style="margin:20px 0 0; font-size:11px; color:#a39c90;">
                    © ${new Date().getFullYear()} رُقِيّ — جميع الحقوق محفوظة
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `,
        });
        return {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            message: 'A verification code has been sent to your email.',
        };
    }
    parseDuration(duration) {
        const match = duration.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error(`Invalid duration format: ${duration}`);
        }
        const value = Number(match[1]);
        const unit = match[2];
        const multipliers = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        return value * multipliers[unit];
    }
    async verifyEmail(dto) {
        const user = await this.usersService.findById(dto.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('Email is already verified');
        }
        if (!user.emailVerification?.otpHash) {
            throw new BadRequestException('OTP not found');
        }
        if (!user.emailVerification.expiresAt) {
            throw new BadRequestException('OTP expiration not found');
        }
        if (new Date() > user.emailVerification.expiresAt) {
            throw new BadRequestException('OTP has expired. Please request a new OTP');
        }
        const isValidOtp = await bcrypt.compare(dto.otp, user.emailVerification.otpHash);
        if (!isValidOtp) {
            throw new BadRequestException('Invalid OTP');
        }
        const activatedUser = await this.usersService.activateUser(user._id.toString());
        return {
            user: {
                id: activatedUser._id,
                studentId: activatedUser.studentId,
                name: activatedUser.name,
                email: activatedUser.email,
                role: activatedUser.role,
                status: activatedUser.status,
            },
            message: 'Email verified successfully',
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        MailService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map