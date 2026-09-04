import { Injectable, Inject } from '@nestjs/common';
import { SMS_PROVIDER, SmsProvider } from './sms.interface';

@Injectable()
export class SmsService {
  constructor(@Inject(SMS_PROVIDER) private readonly provider: SmsProvider) {}

  /**
   * Send an OTP SMS in Bangla format
   */
  async sendOtp(phoneNumber: string, otp: string, expiryMinutes: number = 5): Promise<boolean> {
    const message = `আপনার শিক্ষা OTP কোড: ${otp}\nমেয়াদ ${expiryMinutes} মিনিট।\nকোডটি কারো সাথে শেয়ার করবেন না।`;
    const result = await this.provider.sendSms(phoneNumber, message);
    return result.success;
  }

  /**
   * Send access activation notification
   */
  async sendAccessActivated(phoneNumber: string, contentTitle: string): Promise<boolean> {
    const message = `অভিনন্দন! "${contentTitle}" কোর্সে আপনার প্রবেশাধিকার সক্রিয় করা হয়েছে। এখনই শুরু করুন: শিক্ষা অ্যাপ থেকে।`;
    const result = await this.provider.sendSms(phoneNumber, message);
    return result.success;
  }

  /**
   * Send order rejection notification
   */
  async sendOrderRejected(
    phoneNumber: string,
    contentTitle: string,
    reason?: string,
  ): Promise<boolean> {
    const reasonText = reason ? ` কারণ: ${reason}` : '';
    const message = `দুঃখিত! "${contentTitle}" এর জন্য আপনার পেমেন্ট যাচাই করা সম্ভব হয়নি।${reasonText} আরো তথ্যের জন্য যোগাযোগ করুন।`;
    const result = await this.provider.sendSms(phoneNumber, message);
    return result.success;
  }

  /**
   * Send raw SMS
   */
  async sendRaw(phoneNumber: string, message: string): Promise<boolean> {
    const result = await this.provider.sendSms(phoneNumber, message);
    return result.success;
  }
}
