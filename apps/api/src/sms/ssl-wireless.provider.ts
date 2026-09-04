import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsProvider } from './sms.interface';

/**
 * SSL Wireless SMS Gateway integration.
 * Docs: https://www.sslwireless.com/sms-api/
 *
 * API Format:
 * POST https://sms.sslwireless.com/pushapi/dynamic/server.php
 * Params: user, pass, senderid, smstext, num
 */
@Injectable()
export class SslWirelessSmsProvider implements SmsProvider {
  private readonly logger = new Logger(SslWirelessSmsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    const username = this.configService.get<string>('SSL_WIRELESS_USERNAME');
    const password = this.configService.get<string>('SSL_WIRELESS_PASSWORD');
    const senderId = this.configService.get<string>('SSL_WIRELESS_SENDER_ID', 'ELEARN');
    const apiUrl = this.configService.get<string>(
      'SSL_WIRELESS_API_URL',
      'https://sms.sslwireless.com/pushapi/dynamic/server.php',
    );

    // Normalize phone number: remove +88 or 88 prefix, keep 11 digits
    const normalizedPhone = to.replace(/^(\+88|88)/, '');

    try {
      const response = await axios.post(
        apiUrl,
        new URLSearchParams({
          user: username!,
          pass: password!,
          senderid: senderId,
          smstext: message,
          num: normalizedPhone,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
        },
      );

      // SSL Wireless returns a comma-separated string: status,messageId
      const responseData = response.data?.toString() || '';
      const isSuccess = responseData.includes('ACCEPTED') || responseData.startsWith('1,');

      if (isSuccess) {
        this.logger.log(`✅ SMS sent to ${normalizedPhone}`);
        return { success: true, messageId: responseData.split(',')[1]?.trim() };
      } else {
        this.logger.error(`❌ SMS failed for ${normalizedPhone}: ${responseData}`);
        return { success: false };
      }
    } catch (error) {
      this.logger.error(`❌ SMS gateway error: ${(error as Error).message}`);
      return { success: false };
    }
  }
}
