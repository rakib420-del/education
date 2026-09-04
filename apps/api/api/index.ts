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
      let express, NestFactory, ExpressAdapter, ValidationPipe, AppModule;
      try {
        express = require('express');
        NestFactory = require('@nestjs/core').NestFactory;
        ExpressAdapter = require('@nestjs/platform-express').ExpressAdapter;
        ValidationPipe = require('@nestjs/common').ValidationPipe;
        AppModule = require('../src/app.module').AppModule;
      } catch (importErr: any) {
        return res.status(500).json({
          error: 'Module Import Failed',
          message: importErr?.message || String(importErr),
          stack: importErr?.stack || null,
        });
      }

      try {
        const server = express();
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
        cachedServer = server;
      } catch (nestErr: any) {
        return res.status(500).json({
          error: 'Nest App Init Failed',
          message: nestErr?.message || String(nestErr),
          stack: nestErr?.stack || null,
        });
      }
    }

    let targetUrl = req.url;
    if (targetUrl.startsWith('/api')) {
      targetUrl = targetUrl.substring(4) || '/';
    }

    req.url = targetUrl;
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

