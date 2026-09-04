let cachedServer: any;
let initError: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (req.url === '/' || req.url === '' || req.url === '/api' || req.url === '/api/') {
      return res.status(200).json({
        status: 'ok',
        service: 'Bangla E-Learning API',
        message: 'API is running on Vercel Serverless',
        endpoints: '/api/content',
      });
    }

    if (!cachedServer) {
      const express = require('express');
      const { NestFactory } = require('@nestjs/core');
      const { ExpressAdapter } = require('@nestjs/platform-express');
      const { ValidationPipe } = require('@nestjs/common');
      const { AppModule } = require('../src/app.module');

      const server = express();
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
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
      cachedServer = server;
    }

    return cachedServer(req, res);
  } catch (err: any) {
    console.error('Vercel Handler Crash:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}

