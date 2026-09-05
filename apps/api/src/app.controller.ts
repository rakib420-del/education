import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get(['', '/', 'api'])
  getAppStatus() {
    return {
      status: 'ok',
      service: 'Bangla E-Learning API',
      message: 'NestJS API is running cleanly on Vercel Serverless',
      endpoints: '/api/health',
    };
  }
}

