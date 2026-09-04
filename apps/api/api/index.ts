import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createServer = async (expressInstance: any) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
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
  return app;
};

let cachedServer: any;

export default async function handler(req: any, res: any) {
  if (req.url === '/' || req.url === '' || req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({
      status: 'ok',
      service: 'Bangla E-Learning API',
      message: 'API is running on Vercel Serverless',
      endpoints: '/api/content',
    });
  }

  try {
    if (!cachedServer) {
      cachedServer = await createServer(server);
    }
    return server(req, res);
  } catch (err: any) {
    console.error('Vercel Handler Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || 'Server initialization failed',
      stack: err?.stack || null,
    });
  }
}
