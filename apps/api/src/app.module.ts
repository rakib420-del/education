import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule }   from './prisma/prisma.module';
import { MailerModule }   from './mailer/mailer.module';
import { AuthModule }     from './auth/auth.module';
import { UsersModule }    from './users/users.module';
import { ContentModule }  from './content/content.module';
import { OrdersModule }   from './orders/orders.module';
import { AdminModule }    from './admin/admin.module';
import { StorageModule }  from './storage/storage.module';
import { StreamModule }   from './stream/stream.module';
import { HealthModule }   from './health/health.module';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      envFilePath: ['.env', '../../.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // Infrastructure
    PrismaModule,
    MailerModule,  // global — MailerService available everywhere
    StorageModule,
    StreamModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ContentModule,
    OrdersModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
