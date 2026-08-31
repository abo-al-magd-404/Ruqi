import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('mail.host'),
      port: this.configService.getOrThrow<number>('mail.port'),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('mail.user'),
        pass: this.configService.getOrThrow<string>('mail.password'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const from = this.configService.getOrThrow<string>('mail.from');
    const mailOptions = {
      from: `"منصة رُقِيّ التعليمية" <${from}>`,
      to,
      subject: 'رمز التحقق من الحساب - منصة رُقِيّ',
      html: `
        <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333333; text-align: center;">أهلاً بك في منصة رُقِيّ التعليمية</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.5;">شُكراً لتسجيلك معنا. رمز التحقق الخاص بحسابك هو:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background-color: #c49a45; color: white; font-size: 28px; font-weight: bold; padding: 10px 25px; border-radius: 6px; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #777777; font-size: 14px;">ينتهي هذا الرمز خلال 10 دقائق.</p>
            <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بآمان.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`فشل إرسال البريد الإلكتروني إلى ${to}`, error);
      throw error;
    }
  }
}
