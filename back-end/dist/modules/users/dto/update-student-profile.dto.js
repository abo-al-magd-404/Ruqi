var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, Length, Matches, MinLength, } from 'class-validator';
export class UpdateStudentProfileDto {
    name;
    password;
    phoneNumber;
    address;
    educationalStage;
}
__decorate([
    IsOptional(),
    IsString({ message: 'الاسم يجب أن يكون نصاً' }),
    Length(3, 100, { message: 'الاسم يجب أن يكون بين 3 و 100 حرف' }),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "name", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'كلمة المرور يجب أن تكون نصاً' }),
    MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' }),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "password", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' }),
    Matches(/^01[0125]\d{8}$/, {
        message: 'رقم الهاتف يجب أن يكون رقم مصري صالح',
    }),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "phoneNumber", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'العنوان يجب أن يكون نصاً' }),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "address", void 0);
__decorate([
    IsOptional(),
    IsString({ message: 'المرحلة التعليمية يجب أن تكون نصاً' }),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "educationalStage", void 0);
//# sourceMappingURL=update-student-profile.dto.js.map