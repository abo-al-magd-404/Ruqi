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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/schemas/user.schema.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { UserStatus } from '../../common/enums/user-status.enum.js';
import { generateUserId } from '../../common/utils/user-id.util.js';
let UsersSeed = class UsersSeed {
    userModel;
    configService;
    constructor(userModel, configService) {
        this.userModel = userModel;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.seedAdmin();
        await this.seedTeacher();
    }
    async seedAdmin() {
        const email = this.configService
            .getOrThrow('seed.admin.email')
            .toLowerCase()
            .trim();
        const existingUser = await this.userModel.exists({
            email,
            role: UserRole.ADMINISTRATOR,
        });
        if (existingUser) {
            return;
        }
        const password = this.configService.getOrThrow('seed.admin.password');
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new this.userModel({
            userId: generateUserId(),
            email,
            password: hashedPassword,
            name: this.configService.getOrThrow('seed.admin.name'),
            phoneNumber: this.configService.getOrThrow('seed.admin.phoneNumber'),
            address: this.configService.getOrThrow('seed.admin.address'),
            role: UserRole.ADMINISTRATOR,
            status: UserStatus.ACTIVE,
        });
        await user.save();
        console.log(`Admin user created: ${email}`);
    }
    async seedTeacher() {
        const email = this.configService
            .getOrThrow('seed.teacher.email')
            .toLowerCase()
            .trim();
        const existingUser = await this.userModel.exists({
            email,
            role: UserRole.TEACHER,
        });
        if (existingUser) {
            return;
        }
        const password = this.configService.getOrThrow('seed.teacher.password');
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new this.userModel({
            userId: generateUserId(),
            email,
            password: hashedPassword,
            name: this.configService.getOrThrow('seed.teacher.name'),
            phoneNumber: this.configService.getOrThrow('seed.teacher.phoneNumber'),
            address: this.configService.getOrThrow('seed.teacher.address'),
            role: UserRole.TEACHER,
            status: UserStatus.ACTIVE,
        });
        await user.save();
        console.log(`Teacher user created: ${email}`);
    }
};
UsersSeed = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model,
        ConfigService])
], UsersSeed);
export { UsersSeed };
//# sourceMappingURL=users.seed.js.map