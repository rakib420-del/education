import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('db.afpatcubzjrlrdmluzeg.supabase.co')) {
      process.env.DATABASE_URL = process.env.DATABASE_URL
        .replace(
          'postgres@db.afpatcubzjrlrdmluzeg.supabase.co:5432',
          'postgres.afpatcubzjrlrdmluzeg@aws-1-ap-northeast-2.pooler.supabase.com:5432'
        )
        .replace(
          'postgres@db.afpatcubzjrlrdmluzeg.supabase.co',
          'postgres.afpatcubzjrlrdmluzeg@aws-1-ap-northeast-2.pooler.supabase.com:5432'
        );
    }

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
    try {
      await this.$connect();
      this.logger.log('✅ Connected to database');
      // Auto-initialize SQLite tables if running in serverless / tmp db environment
      if (process.env.VERCEL) {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "content_items" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "type" TEXT NOT NULL,
            "title_bn" TEXT NOT NULL,
            "title_en" TEXT,
            "description_bn" TEXT,
            "description_en" TEXT,
            "slug" TEXT NOT NULL,
            "category" TEXT NOT NULL DEFAULT 'OTHER',
            "level" TEXT NOT NULL DEFAULT 'BEGINNER',
            "price" REAL NOT NULL,
            "discount_price" REAL,
            "thumbnail_url" TEXT,
            "preview_asset_url" TEXT,
            "is_featured" BOOLEAN NOT NULL DEFAULT false,
            "is_published" BOOLEAN NOT NULL DEFAULT false,
            "created_by_admin_id" TEXT,
            "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" DATETIME NOT NULL
          );
        `);
      }
    } catch (err) {
      this.logger.error('Database connection warning:', err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
