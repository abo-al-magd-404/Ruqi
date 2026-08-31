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
var UsersSeeder_1;
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../schemas/user.schema.js';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../../../common/enums/user-role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';
import { ConfigService } from '@nestjs/config';
let UsersSeeder = UsersSeeder_1 = class UsersSeeder {
    userModel;
    configService;
    logger = new Logger(UsersSeeder_1.name);
    constructor(userModel, configService) {
        this.userModel = userModel;
        this.configService = configService;
    }
    async onApplicationBootstrap() {
        await this.seedAdmin();
        await this.seedTeacher();
    }
    async seedAdmin() {
        const adminEmail = this.configService.getOrThrow('SEED_ADMIN_EMAIL');
        const existingAdmin = await this.userModel.findOne({
            email: adminEmail.toLowerCase(),
        });
        if (!existingAdmin) {
            const plainPassword = this.configService.getOrThrow('SEED_ADMIN_PASSWORD');
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            await this.userModel.create({
                name: this.configService.getOrThrow('SEED_ADMIN_NAME'),
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                role: UserRole.ADMIN,
                status: UserStatus.ACTIVE,
                phoneNumber: this.configService.getOrThrow('SEED_ADMIN_PHONE'),
                address: this.configService.getOrThrow('SEED_ADMIN_ADDRESS'),
            });
            this.logger.log('✅ Default Admin account created successfully.');
        }
    }
    async seedTeacher() {
        const teacherEmail = this.configService.getOrThrow('SEED_TEACHER_EMAIL');
        const existingTeacher = await this.userModel.findOne({
            email: teacherEmail.toLowerCase(),
        });
        if (!existingTeacher) {
            const plainPassword = this.configService.getOrThrow('SEED_TEACHER_PASSWORD');
            const hashedPassword = await bcrypt.hash(plainPassword, 10);
            await this.userModel.create({
                name: this.configService.getOrThrow('SEED_TEACHER_NAME'),
                email: teacherEmail.toLowerCase(),
                password: hashedPassword,
                role: UserRole.TEACHER,
                status: UserStatus.ACTIVE,
                phoneNumber: this.configService.getOrThrow('SEED_TEACHER_PHONE'),
                address: this.configService.getOrThrow('SEED_TEACHER_ADDRESS'),
            });
            this.logger.log('✅ Default Teacher account created successfully.');
        }
    }
};
UsersSeeder = UsersSeeder_1 = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model,
        ConfigService])
], UsersSeeder);
export { UsersSeeder };
//# sourceMappingURL=users.seeder.js.map