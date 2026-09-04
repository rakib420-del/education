import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Admin login ─────────────────────────────

  async login(email: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('ইমেইল বা পাসওয়ার্ড সঠিক নয়');
    if (!admin.isActive) throw new UnauthorizedException('এই অ্যাডমিন অ্যাকাউন্ট নিষ্ক্রিয়');

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) throw new UnauthorizedException('ইমেইল বা পাসওয়ার্ড সঠিক নয়');

    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, role: admin.role },
      {
        secret: this.configService.get<string>('ADMIN_JWT_SECRET'),
        expiresIn: this.configService.get<string>('ADMIN_JWT_EXPIRES_IN', '8h'),
      },
    );

    return {
      accessToken: token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    };
  }

  // ─── Update admin credentials ───────────────────

  async updateCredentials(adminId: string, data: { email?: string; currentPassword?: string; newPassword?: string }) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('অ্যাডমিন পাওয়া যায়নি');

    const updateData: any = {};

    if (data.email && data.email !== admin.email) {
      const existingEmail = await this.prisma.adminUser.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new UnauthorizedException('এই ইমেইলটি আগে থেকেই ব্যবহৃত হচ্ছে');
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new UnauthorizedException('বর্তমান পাসওয়ার্ড প্রয়োজন');
      }
      const isValid = await bcrypt.compare(data.currentPassword, admin.passwordHash);
      if (!isValid) throw new UnauthorizedException('বর্তমান পাসওয়ার্ড সঠিক নয়');
      
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.adminUser.update({
        where: { id: adminId },
        data: updateData,
      });
    }

    return { message: 'অ্যাডমিন প্রোফাইল আপডেট করা হয়েছে' };
  }

  // ─── Dashboard stats ─────────────────────────

  async getDashboardStats() {
    const [totalUsers, totalOrders, pendingOrders, verifiedOrders, totalContent] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'VERIFIED' } }),
        this.prisma.contentItem.count({ where: { isPublished: true } }),
      ]);

    // Total revenue (from verified orders)
    const revenueResult = await this.prisma.order.aggregate({
      where: { status: 'VERIFIED' },
      _sum: { pricePaid: true },
    });

    return {
      totalUsers,
      totalOrders,
      pendingOrders,
      verifiedOrders,
      totalContent,
      totalRevenue: Number(revenueResult._sum.pricePaid || 0),
    };
  }

  // ─── User management ─────────────────────────

  async listUsers(page = 1, limit = 20, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, email: true, mobileNumber: true, isBlocked: true,
          createdAt: true,
          accessGrants: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              contentItem: { select: { id: true, titleBn: true, type: true } },
            },
          },
          _count: { select: { orders: true, accessGrants: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async blockUser(userId: string) {
    // Set isBlocked true and clear active session token
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true, activeSessionToken: null },
    });
    return { message: 'User account blocked and session cleared' };
  }

  async unblockUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
    });
    return { message: 'User account unblocked' };
  }

  async forceLogoutUser(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { activeSessionToken: null },
    });
    return { message: 'Session cleared' };
  }

  async deleteUser(userId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Due to onDelete: Cascade in Prisma schema, this will also delete associated records
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'User account successfully deleted' };
  }

  async getUserDevices(userId: string) {
    return this.prisma.userDevice.findMany({
      where: { userId },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  async blockDevice(deviceId: string) {
    await this.prisma.userDevice.update({
      where: { id: deviceId },
      data: { isBlocked: true },
    });
    return { message: 'Device blocked successfully' };
  }

  async unblockDevice(deviceId: string) {
    await this.prisma.userDevice.update({
      where: { id: deviceId },
      data: { isBlocked: false },
    });
    return { message: 'Device unblocked successfully' };
  }

  // ─── List access grants ─────────────────

  async listAccessGrants(status?: string, page = 1, limit = 20) {
    const where: any = {};
    if (status) where.status = status;

    const [grants, total] = await Promise.all([
      this.prisma.contentAccessGrant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user:        { select: { id: true, name: true, email: true } },
          contentItem: { select: { id: true, titleBn: true, type: true, thumbnailUrl: true } },
          order:       { select: { id: true, pricePaid: true, paymentMethod: true, status: true } },
          admin:       { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contentAccessGrant.count({ where }),
    ]);

    return { grants, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async grantAccess(userQuery: string, contentQuery: string, adminId: string) {
    // Find user by id, email, or mobileNumber
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: userQuery },
          { email: userQuery.toLowerCase() },
          { mobileNumber: userQuery },
        ],
      },
    });
    if (!user) throw new NotFoundException('ব্যবহারকারী পাওয়া যায়নি (ইমেইল/ফোন/ID ভুল)');

    // Find content by id or slug
    const content = await this.prisma.contentItem.findFirst({
      where: {
        OR: [
          { id: contentQuery },
          { slug: contentQuery },
        ],
      },
    });
    if (!content) throw new NotFoundException('কোর্স বা বই পাওয়া যায়নি');

    const existing = await this.prisma.contentAccessGrant.findFirst({
      where: { userId: user.id, contentItemId: content.id },
    });

    if (existing) {
      return this.prisma.contentAccessGrant.update({
        where: { id: existing.id },
        data: { status: 'ACTIVE', activatedAt: new Date(), grantedByAdminId: adminId },
      });
    }

    return this.prisma.contentAccessGrant.create({
      data: {
        userId: user.id,
        contentItemId: content.id,
        grantedByAdminId: adminId,
        status: 'ACTIVE',
        activatedAt: new Date(),
      },
    });
  }

  async revokeAccess(userId: string, contentItemId: string, reason?: string) {
    return this.prisma.contentAccessGrant.updateMany({
      where: { userId, contentItemId, status: 'ACTIVE' },
      data: { status: 'REVOKED', revokedAt: new Date(), revokeReason: reason },
    });
  }

  // ─── Affiliate CRUD ──────────────────────────

  async createAffiliateOffer(data: any) {
    return this.prisma.affiliateOffer.create({ data });
  }

  async updateAffiliateOffer(id: string, data: any) {
    return this.prisma.affiliateOffer.update({ where: { id }, data });
  }

  async deleteAffiliateOffer(id: string) {
    return this.prisma.affiliateOffer.delete({ where: { id } });
  }
}
