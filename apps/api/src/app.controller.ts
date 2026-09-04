import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getAppStatus() {
    return {
      status: 'ok',
      service: 'Bangla E-Learning API',
      message: 'API is running cleanly on Vercel Serverless',
      endpoints: '/api/content',
    };
  }
}
