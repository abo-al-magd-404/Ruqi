var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsNotEmpty, IsString, Length, MinLength, } from 'class-validator';
export class ResetPasswordDto {
    email;
    otp;
    newPassword;
}
__decorate([
    IsEmail({}, { message: 'البريد الإلكتروني غير صالح' }),
    IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    IsString({ message: 'رمز التحقق يجب أن يكون نصاً' }),
    Length(6, 6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' }),
    IsNotEmpty({ message: 'رمز التحقق مطلوب' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "otp", void 0);
__decorate([
    IsString({ message: 'كلمة المرور يجب أن تكون نصاً' }),
    MinLength(8, { message: 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف' }),
    IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=reset-password.dto.js.map