import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OptionalSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const user = await this.prisma.user.findFirst({
        where: { activeSessionToken: token, isBlocked: false },
      });
      if (user) {
        req.user = user;
      }
    }
    return true;
  }
}
