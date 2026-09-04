import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let isInitialized = false;

const initServer = async () => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn'] }
  );

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

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
    console.error('Vercel Handler Crash:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}

