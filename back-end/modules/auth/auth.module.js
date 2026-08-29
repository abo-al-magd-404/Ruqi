var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { MailModule } from '../../common/mail/mail.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AppJwtModule } from '../../common/jwt/jwt.module.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [UsersModule, MailModule, AppJwtModule],
        controllers: [AuthController],
        providers: [AuthService],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map