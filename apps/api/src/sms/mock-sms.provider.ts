import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from './sms.interface';

/**
 * Mock SMS provider for development/testing.
 * Logs the OTP to console instead of sending a real SMS.
 */
@Injectable()
export class MockSmsProvider implements SmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendSms(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    this.logger.warn(`📱 [MOCK SMS] To: ${to}`);
    this.logger.warn(`📱 [MOCK SMS] Message: ${message}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}
