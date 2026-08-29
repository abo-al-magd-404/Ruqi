var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
let MailService = class MailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.getOrThrow('mail.host'),
            port: this.configService.getOrThrow('mail.port'),
            secure: this.configService.getOrThrow('mail.port') === 465,
            auth: {
                user: this.configService.getOrThrow('mail.user'),
                pass: this.configService.getOrThrow('mail.password'),
            },
        });
    }
    async sendMail(options) {
        await this.transporter.sendMail({
            from: this.configService.getOrThrow('mail.from'),
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
};
MailService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], MailService);
export { MailService };
//# sourceMappingURL=mail.service.js.map