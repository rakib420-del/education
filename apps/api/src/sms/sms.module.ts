import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SMS_PROVIDER } from './sms.interface';
import { SslWirelessSmsProvider } from './ssl-wireless.provider';
import { MockSmsProvider } from './mock-sms.provider';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [
    {
      provide: SMS_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const username = configService.get<string>('SSL_WIRELESS_USERNAME');
        const isDev = configService.get('NODE_ENV') === 'development';

        if (isDev && !username) {
          console.warn('⚠️  SMS: No SSL Wireless credentials — using mock provider (logs to console)');
          return new MockSmsProvider();
        }
        return new SslWirelessSmsProvider(configService);
      },
    },
    SmsService,
  ],
  exports: [SmsService],
})
export class SmsModule {}
