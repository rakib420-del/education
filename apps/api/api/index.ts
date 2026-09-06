import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

const server = express();

server.use((req: any, _res: any, next: any) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    req.originalUrl = req.url;
  }
  next();
});

let isInitialized = false;

const initServer = async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] }
  );

  app.setGlobalPrefix('api', { exclude: ['', '/', 'api'] });

  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      if (
        requestOrigin.includes('localhost') ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.includes('shikkha')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  isInitialized = true;
};

export default async function handler(req: any, res: any) {
  try {
    if (!isInitialized) {
      await initServer();
    }
    return server(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Vercel Serverless Crash',
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}
