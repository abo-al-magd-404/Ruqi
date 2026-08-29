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
import { ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { generateUserId } from '../../common/utils/user-id.util.js';
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async createStudent(data) {
        const email = data.email.toLowerCase().trim();
        const existingUser = await this.userModel.findOne({ email }).lean().exec();
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }
        const hashedPassword = await bcrypt.hash(data.password, 12);
        const userId = generateUserId();
        const user = new this.userModel({
            userId,
            email,
            password: hashedPassword,
            name: data.name.trim(),
            phoneNumber: data.phoneNumber.trim(),
            address: data.address.trim(),
            ...(data.educationalStageId && {
                educationalStage: data.educationalStageId,
            }),
            role: UserRole.STUDENT,
            status: UserStatus.PENDING,
        });
        return user.save();
    }
    async setEmailVerification(userId, data) {
        await this.userModel
            .updateOne({ _id: userId }, {
            $set: {
                emailVerification: data,
            },
        })
            .exec();
    }
    async activateUser(userId) {
        const user = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                status: UserStatus.ACTIVE,
            },
            $unset: {
                emailVerification: 1,
            },
        }, {
            new: true,
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
    async findById(userId) {
        return this.userModel.findById(userId);
    }
    async findByEmail(email) {
        return this.userModel
            .findOne({
            email: email.toLowerCase().trim(),
        })
            .exec();
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map