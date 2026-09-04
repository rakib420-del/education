import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentQueryDto, CreateContentDto, CreateLessonDto } from './dto/content.dto';
import { AccessStatus, ContentType, OrderStatus } from '@elearning/shared';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Public: list content ───────────────────

  async findAll(query: ContentQueryDto, userId?: string) {
    const { type, category, isFeatured, page = 1, limit = 12, search, includeUnpublished } = query;

    const where: any = {};
    if (!includeUnpublished) {
      where.isPublished = true;
    }
    if (type) where.type = type;
    if (category) where.category = category;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (search) {
      where.OR = [
        { titleBn: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.contentItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          lessons: { orderBy: { orderIndex: 'asc' } },
          chapters: { orderBy: { orderIndex: 'asc' } },
          _count: {
            select: {
              lessons: true,
              chapters: true,
              orders: { where: { status: 'VERIFIED' } },
              reviews: { where: { isApproved: true } },
            },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      }),
      this.prisma.contentItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapContentItem(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Public: single content detail ──────────

  async findBySlug(slugOrId: string, userId?: string) {
    const item = await this.prisma.contentItem.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        chapters: {
          orderBy: { orderIndex: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            // We only store userId, not a full relation for privacy
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: { where: { status: 'VERIFIED' } },
            reviews: { where: { isApproved: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException('কোর্স বা বই পাওয়া যায়নি');

    // Check if user has access (via Active Grant or Verified Order) or pending order
    let hasAccess = false;
    let hasPendingOrder = false;

    if (userId) {
      const grant = await this.prisma.contentAccessGrant.findFirst({
        where: { userId, contentItemId: item.id, status: AccessStatus.ACTIVE },
      });
      if (grant) {
        hasAccess = true;
      } else {
        const order = await this.prisma.order.findFirst({
          where: { userId, contentItemId: item.id },
          orderBy: { createdAt: 'desc' },
        });
        if (order?.status === OrderStatus.VERIFIED) {
          hasAccess = true;
        } else if (order?.status === OrderStatus.PENDING) {
          hasPendingOrder = true;
        }
      }
    }

    return {
      ...this.mapContentItem(item),
      lessons: item.lessons.map((l) => ({
        id: l.id,
        titleBn: l.titleBn,
        orderIndex: l.orderIndex,
        durationSeconds: l.durationSeconds,
        isPreview: l.isPreview,
        // Only expose videoUrl if it's a preview lesson or user has full access
        videoUrl: hasAccess || l.isPreview ? l.videoUrl : undefined,
      })),
      chapters: item.chapters.map((c) => ({
        id: c.id,
        titleBn: c.titleBn,
        orderIndex: c.orderIndex,
        pageCount: c.pageCount,
        isPreview: c.isPreview,
      })),
      hasAccess,
      hasPendingOrder,
    };
  }

  // ─── Admin: create content ───────────────────

  async create(dto: CreateContentDto, adminId: string) {
    return this.prisma.contentItem.create({
      data: {
        ...dto,
        createdByAdminId: adminId,
      },
    });
  }

  // ─── Admin: update content ───────────────────

  async update(id: string, dto: Partial<CreateContentDto>) {
    return this.prisma.contentItem.update({
      where: { id },
      data: dto,
    });
  }

  // ─── Admin: add lesson ───────────────────────

  async addLesson(contentItemId: string, dto: CreateLessonDto) {
    const item = await this.prisma.contentItem.findUnique({ where: { id: contentItemId } });
    if (!item || item.type !== ContentType.COURSE) {
      throw new NotFoundException('কোর্স পাওয়া যায়নি');
    }

    return this.prisma.courseLesson.create({
      data: { contentItemId, ...dto },
    });
  }

  // ─── Admin: delete content ───────────────────

  async remove(id: string) {
    const item = await this.prisma.contentItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('কোর্স বা কনটেন্ট পাওয়া যায়নি');
    }

    await this.prisma.$transaction(async (tx) => {
      // Find all lessons for this content item
      const lessons = await tx.courseLesson.findMany({
        where: { contentItemId: id },
        select: { id: true },
      });
      const lessonIds = lessons.map((l) => l.id);

      // Clean up lesson progress records
      if (lessonIds.length > 0) {
        await tx.lessonProgress.deleteMany({
          where: { lessonId: { in: lessonIds } },
        });
      }

      // Clean up all related child records
      await tx.courseLesson.deleteMany({ where: { contentItemId: id } });
      await tx.bookChapter.deleteMany({ where: { contentItemId: id } });
      await tx.watermarkLog.deleteMany({ where: { contentItemId: id } });
      await tx.review.deleteMany({ where: { contentItemId: id } });
      await tx.contentAccessGrant.deleteMany({ where: { contentItemId: id } });
      await tx.order.deleteMany({ where: { contentItemId: id } });

      // Delete main content item
      await tx.contentItem.delete({ where: { id } });
    });

    return { message: 'কোর্স/কনটেন্ট সফলভাবে মুছে ফেলা হয়েছে' };
  }

  // ─── Affiliate offers ────────────────────────

  async findAffiliateOffers() {
    return this.prisma.affiliateOffer.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async trackAffiliateClick(offerId: string) {
    return this.prisma.affiliateOffer.update({
      where: { id: offerId },
      data: { clickCount: { increment: 1 } },
    });
  }

  // ─── Private helpers ─────────────────────────

  private mapContentItem(item: any) {
    const ratings = item.reviews?.map((r: any) => r.rating) || [];
    const averageRating = ratings.length
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : null;

    return {
      id: item.id,
      type: item.type,
      titleBn: item.titleBn,
      titleEn: item.titleEn,
      descriptionBn: item.descriptionBn,
      slug: item.slug,
      category: item.category,
      level: item.level,
      price: Number(item.price),
      discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
      thumbnailUrl: item.thumbnailUrl,
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      lessons: item.lessons ? item.lessons.map((l: any) => ({
        id: l.id,
        titleBn: l.titleBn,
        orderIndex: l.orderIndex,
        durationSeconds: l.durationSeconds,
        videoAssetId: l.videoAssetId,
        videoUrl: l.videoUrl,
        isPreview: l.isPreview,
      })) : [],
      chapters: item.chapters ? item.chapters.map((c: any) => ({
        id: c.id,
        titleBn: c.titleBn,
        orderIndex: c.orderIndex,
        pdfAssetKey: c.pdfAssetKey,
        pageCount: c.pageCount,
        isPreview: c.isPreview,
      })) : [],
      lessonCount: item._count?.lessons || item.lessons?.length || 0,
      chapterCount: item._count?.chapters || item.chapters?.length || 0,
      enrollmentCount: item._count?.orders || 0,
      reviewCount: item._count?.reviews || 0,
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
    };
  }

  async updateLesson(lessonId: string, dto: any) {
    const lesson = await this.prisma.courseLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('পাঠ পাওয়া যায়নি');

    return this.prisma.courseLesson.update({
      where: { id: lessonId },
      data: dto,
    });
  }

  async deleteLesson(lessonId: string) {
    const lesson = await this.prisma.courseLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('পাঠ পাওয়া যায়নি');

    await this.prisma.$transaction([
      this.prisma.lessonProgress.deleteMany({ where: { lessonId } }),
      this.prisma.courseLesson.delete({ where: { id: lessonId } }),
    ]);
    return { message: 'পাঠ মুছে ফেলা হয়েছে' };
  }

  // ─── Admin: chapter / PDF methods ────────────

  async addChapter(contentItemId: string, dto: any) {
    const item = await this.prisma.contentItem.findUnique({ where: { id: contentItemId } });
    if (!item || (item.type !== ContentType.BOOK && item.type !== ContentType.NOTE)) {
      throw new NotFoundException('বই বা নোট পাওয়া যায়নি');
    }

    return this.prisma.bookChapter.create({
      data: { contentItemId, ...dto },
    });
  }

  async updateChapter(chapterId: string, dto: any) {
    const chapter = await this.prisma.bookChapter.findUnique({ where: { id: chapterId } });
    if (!chapter) throw new NotFoundException('অধ্যায় পাওয়া যায়নি');

    return this.prisma.bookChapter.update({
      where: { id: chapterId },
      data: dto,
    });
  }

  async deleteChapter(chapterId: string) {
    await this.prisma.bookChapter.delete({ where: { id: chapterId } });
    return { message: 'অধ্যায় মুছে ফেলা হয়েছে' };
  }
}
