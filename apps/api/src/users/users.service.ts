import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessStatus } from '@elearning/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, mobileNumber: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, mobileNumber: true },
    });
  }

  async deleteMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Your account has been deleted' };
  }

  /** Single-device: no device sessions anymore — just return the session status */
  async getActiveSessions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { activeSessionToken: true },
    });
    return { hasActiveSession: !!user?.activeSessionToken };
  }

  async getMyContent(userId: string) {
    // 0. Auto-sync any access grant for verified orders
    try {
      await this.prisma.contentAccessGrant.updateMany({
        where: {
          userId,
          status: { not: AccessStatus.ACTIVE },
          order: { status: 'VERIFIED' as any },
        },
        data: { status: AccessStatus.ACTIVE, activatedAt: new Date() },
      });
    } catch {
      /* ignore */
    }

    // 1. Fetch active grants
    const grants = await this.prisma.contentAccessGrant.findMany({
      where: { userId, status: AccessStatus.ACTIVE },
      include: {
        contentItem: {
          select: {
            id: true, type: true, titleBn: true, thumbnailUrl: true, slug: true,
            _count: { select: { lessons: true, chapters: true } },
          },
        },
      },
      orderBy: { activatedAt: 'desc' },
    });

    // 2. Fetch verified orders as fallback
    const verifiedOrders = await this.prisma.order.findMany({
      where: { userId, status: 'VERIFIED' },
      include: {
        contentItem: {
          select: {
            id: true, type: true, titleBn: true, thumbnailUrl: true, slug: true,
            _count: { select: { lessons: true, chapters: true } },
          },
        },
      },
    });

    // Combine grants & verified orders uniquely
    const grantContentIds = new Set(grants.map((g) => g.contentItemId));
    const combined = [...grants];

    for (const vo of verifiedOrders) {
      if (vo.contentItem && !grantContentIds.has(vo.contentItemId)) {
        combined.push({
          id: vo.id,
          userId,
          contentItemId: vo.contentItemId,
          orderId: vo.id,
          status: AccessStatus.ACTIVE,
          activatedAt: vo.verifiedAt || vo.createdAt,
          revokedAt: null,
          revokeReason: null,
          grantedByAdminId: vo.verifiedByAdminId || null,
          createdAt: vo.createdAt,
          updatedAt: vo.updatedAt,
          contentItem: vo.contentItem,
        } as any);
        grantContentIds.add(vo.contentItemId);
      }
    }

    const courseIds = combined
      .filter((g) => g.contentItem && g.contentItem.type === 'COURSE')
      .map((g) => g.contentItemId);

    const progressCounts: Record<string, number> = {};
    if (courseIds.length > 0) {
      try {
        const completedProgress = await this.prisma.lessonProgress.findMany({
          where: {
            userId,
            isCompleted: true,
            lesson: { contentItemId: { in: courseIds } },
          },
          select: {
            lesson: { select: { contentItemId: true } },
          },
        });

        for (const item of completedProgress) {
          const cId = item.lesson?.contentItemId;
          if (cId) {
            progressCounts[cId] = (progressCounts[cId] || 0) + 1;
          }
        }
      } catch {
        /* ignore */
      }
    }

    return combined.map((g) => ({
      contentItem: g.contentItem,
      activatedAt: g.activatedAt,
      progress: progressCounts[g.contentItemId] || 0,
    }));
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { watchedSeconds: true, isCompleted: true, completedAt: true },
    });
    return progress ?? { watchedSeconds: 0, isCompleted: false, completedAt: null };
  }

  async updateLessonProgress(userId: string, lessonId: string, watchedSeconds: number) {
    const lesson = await this.prisma.courseLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const isCompleted = lesson.durationSeconds
      ? watchedSeconds >= lesson.durationSeconds * 0.9
      : false;

    return this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, watchedSeconds, isCompleted, completedAt: isCompleted ? new Date() : undefined },
      update: { watchedSeconds: { set: Math.max(watchedSeconds, 0) }, isCompleted, completedAt: isCompleted ? new Date() : undefined },
    });
  }
}
