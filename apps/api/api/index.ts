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
    const express = require('express');
    const { NestFactory } = require('@nestjs/core');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const { AppModule } = require('../src/app.module');

    const appServer = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(appServer),
      { logger: ['error', 'warn'] }
    );

    app.setGlobalPrefix('api');
    app.enableCors({ origin: '*', credentials: true });
    await app.init();

    return appServer(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Vercel Function Error',
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}

