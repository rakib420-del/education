import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export const ADMIN_JWT_STRATEGY = 'admin-jwt';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, ADMIN_JWT_STRATEGY) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ADMIN_JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!admin) throw new UnauthorizedException('অ্যাডমিন পাওয়া যায়নি');
    if (!admin.isActive) throw new UnauthorizedException('এই অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয়');

    return { ...admin, sub: admin.id };
  }
}
