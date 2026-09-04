import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No session token provided');
    }

    const token = authHeader.slice(7);

    const user = await this.prisma.user.findFirst({
      where: { activeSessionToken: token },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Session invalid or expired — please log in again',
      );
    }

    if (user.isBlocked) {
      throw new UnauthorizedException(
        'এই অ্যাকাউন্টটি ব্লক করা হয়েছে',
      );
    }

    req.user = user;
    return true;
  }
}
