import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const user = config.get<string>('SMTP_USER', '');
    const pass = (config.get<string>('SMTP_PASS') || '').replace(/\s+/g, '');
    const port = parseInt(config.get<string>('SMTP_PORT', '587'), 10);

    const isGmail = host.includes('gmail');

    this.transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          },
    );
  }

  async sendOtp(to: string, code: string): Promise<void> {
    const from = this.config.get<string>('SMTP_FROM', this.config.get('SMTP_USER'));

    try {
      const info = await this.transporter.sendMail({
        from: `"শিক্ষা Platform" <${from}>`,
        to,
        subject: `Your OTP code: ${code}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
            <h2 style="color:#1a202c;margin-bottom:8px">Your One-Time Password</h2>
            <p style="color:#4a5568;margin-bottom:24px">Use the code below to complete your login. It expires in <strong>5 minutes</strong>.</p>
            <div style="background:#f7fafc;border:2px dashed #e2e8f0;border-radius:8px;padding:20px;text-align:center">
              <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#2d3748">${code}</span>
            </div>
            <p style="color:#718096;font-size:13px;margin-top:20px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`OTP sent to ${to}`);
      this.logger.log(`[DEV] The OTP code is: ${code}`); // ALWAYS log for development debugging
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`[ETHEREAL] Preview URL: ${previewUrl}`);
      }
    } catch (err) {
      // In development, log the OTP to console so you can test without a real SMTP server
      this.logger.warn(`Failed to send email to ${to}: ${err.message}`);
      this.logger.warn(`[DEV] OTP for ${to}: ${code}`);
    }
  }
}
