import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'সার্ভারে সমস্যা হয়েছে, দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as any).message;
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma known request errors (e.g. unique constraint violation P2002)
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target;
        if (Array.isArray(target) && target.includes('email')) {
          message = 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে';
        } else {
          message = 'এই তথ্যের সাথে মিলে যাওয়া একটি অ্যাকাউন্ট ইতিমধ্যে আছে';
        }
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'কাঙ্ক্ষিত তথ্য পাওয়া যায়নি';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = `ডাটাবেস অপারেশন ব্যর্থ হয়েছে (${exception.code})`;
      }
      this.logger.warn(`Prisma Known Error [${exception.code}]: ${exception.message}`);
    } else if (
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'ডাটাবেস কানেকশন পাওয়া যাচ্ছে না। দয়া করে সার্ভার কনফিগারেশন পরীক্ষা করুন।';
      this.logger.error('Prisma Initialization/Connection Error:', exception);
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled Exception:', exception.stack || exception.message);
      message = exception.message || 'সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
