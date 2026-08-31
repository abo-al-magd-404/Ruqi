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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema.js';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async getMyProfile(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt');
        if (!user) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        return {
            message: 'تم جلب بيانات الحساب بنجاح',
            user,
        };
    }
    async updateStudentProfile(userId, updateStudentProfileDto) {
        const updateData = { ...updateStudentProfileDto };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, { $set: updateData }, { returnDocument: 'after', runValidators: true })
            .select('-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt')
            .lean();
        if (!updatedUser) {
            throw new NotFoundException('المستخدم غير موجود');
        }
        return {
            message: 'تم تحديث بيانات حساب الطالب بنجاح',
            user: updatedUser,
        };
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map