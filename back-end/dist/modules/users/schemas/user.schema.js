var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserRole } from '../../../common/enums/user-role.enum.js';
import { UserStatus } from '../../../common/enums/user-status.enum.js';
let User = class User {
    studentId;
    email;
    password;
    name;
    phoneNumber;
    address;
    educationalStage;
    role;
    status;
    emailVerification;
};
__decorate([
    Prop({
        type: String,
        required: true,
        unique: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "studentId", void 0);
__decorate([
    Prop({
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Prop({
        type: String,
        required: true,
    }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Prop({
        type: String,
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Prop({
        type: String,
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    Prop({
        type: String,
        required: true,
        trim: true,
    }),
    __metadata("design:type", String)
], User.prototype, "address", void 0);
__decorate([
    Prop({
        type: Types.ObjectId,
        ref: 'EducationalStage',
        required: false,
    }),
    __metadata("design:type", Types.ObjectId)
], User.prototype, "educationalStage", void 0);
__decorate([
    Prop({
        type: String,
        enum: UserRole,
        required: true,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Prop({
        type: String,
        enum: UserStatus,
        required: true,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    Prop({
        type: {
            otpHash: {
                type: String,
                required: false,
            },
            expiresAt: {
                type: Date,
                required: false,
            },
            lastSentAt: {
                type: Date,
                required: false,
            },
        },
        required: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "emailVerification", void 0);
User = __decorate([
    Schema({
        timestamps: true,
    })
], User);
export { User };
export const UserSchema = SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map