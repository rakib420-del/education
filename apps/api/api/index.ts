export default async function handler(req: any, res: any) {
  try {
    const express = require('express');
    const { NestFactory } = require('@nestjs/core');
    const { ExpressAdapter } = require('@nestjs/platform-express');

    let AppModule;
    try {
      AppModule = require('../src/app.module').AppModule;
    } catch (modErr: any) {
      return res.status(500).json({
        error: 'AppModule Import Error',
        message: modErr?.message || String(modErr),
        stack: modErr?.stack || null,
      });
    }

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
      error: 'Vercel Serverless Crash',
      message: err?.message || String(err),
      stack: err?.stack || null,
    });
  }
}

