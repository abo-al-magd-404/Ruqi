import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private readonly configService;
    private readonly transporter;
    constructor(configService: ConfigService);
    sendMail(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
}
