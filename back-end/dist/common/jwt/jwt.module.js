var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppJwtService } from './app-jwt.service.js';
import { JwtStrategy } from './jwt.strategy.js';
let AppJwtModule = class AppJwtModule {
};
AppJwtModule = __decorate([
    Module({
        imports: [
            JwtModule,
            PassportModule.register({
                defaultStrategy: 'jwt',
            }),
        ],
        providers: [AppJwtService, JwtStrategy],
        exports: [AppJwtService, PassportModule],
    })
], AppJwtModule);
export { AppJwtModule };
//# sourceMappingURL=jwt.module.js.map