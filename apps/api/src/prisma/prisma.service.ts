import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:'))) {
      try {
        const tmpDbPath = '/tmp/dev.db';
        if (!fs.existsSync(tmpDbPath)) {
          const rootDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
          const altDbPath = path.join(process.cwd(), 'dev.db');
          if (fs.existsSync(rootDbPath)) {
            fs.copyFileSync(rootDbPath, tmpDbPath);
          } else if (fs.existsSync(altDbPath)) {
            fs.copyFileSync(altDbPath, tmpDbPath);
          }
        }
        process.env.DATABASE_URL = 'file:/tmp/dev.db';
      } catch (err) {
        console.error('Vercel SQLite setup warning:', err);
      }
    }

    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
