var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
export class SignupDto {
    name;
    email;
    password;
    phoneNumber;
    address;
}
__decorate([
    IsString({ message: 'الاسم يجب أن يكون نصاً' }),
    IsNotEmpty({ message: 'الاسم مطلوب' }),
    __metadata("design:type", String)
], SignupDto.prototype, "name", void 0);
__decorate([
    IsEmail({}, { message: 'البريد الإلكتروني غير صالح' }),
    IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' }),
    __metadata("design:type", String)
], SignupDto.prototype, "email", void 0);
__decorate([
    IsString({ message: 'كلمة المرور يجب أن تكون نصاً' }),
    MinLength(8, { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' }),
    IsNotEmpty({ message: 'كلمة المرور مطلوبة' }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' }),
    IsNotEmpty({ message: 'رقم الهاتف مطلوب' }),
    __metadata("design:type", String)
], SignupDto.prototype, "phoneNumber", void 0);
__decorate([
    IsString({ message: 'العنوان يجب أن يكون نصاً' }),
    IsNotEmpty({ message: 'العنوان مطلوب' }),
    __metadata("design:type", String)
], SignupDto.prototype, "address", void 0);
//# sourceMappingURL=signup.dto.js.map