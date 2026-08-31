import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private transporter;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOtpEmail(to: string, otp: string): Promise<void>;
}
