import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateOrderDto } from './dto/order.dto';
import { AccessStatus, OrderStatus } from '@elearning/shared';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // ─── Create order ────────────────────────────

  async createOrder(userId: string, dto: CreateOrderDto, proofFileBuffer?: Buffer, proofFileName?: string) {
    // Check content exists by ID or slug
    const content = await this.prisma.contentItem.findFirst({
      where: {
        OR: [
          { id: dto.contentItemId },
          { slug: dto.contentItemId },
        ],
      },
    });
    if (!content) throw new NotFoundException('কোর্স বা বই পাওয়া যায়নি');

    // Check for duplicate active grant or pending order
    const existingGrant = await this.prisma.contentAccessGrant.findFirst({
      where: {
        userId,
        contentItemId: content.id,
        status: { in: [AccessStatus.ACTIVE, AccessStatus.PENDING] },
      },
    });
    if (existingGrant) {
      throw new ConflictException('আপনি ইতিমধ্যে এই কোর্সের জন্য অর্ডার করেছেন বা প্রবেশাধিকার আছে');
    }

    const pricePaid = Number(content.discountPrice ?? content.price);
    const isFree = pricePaid === 0;

    // Upload payment proof if provided
    let paymentProofUrl: string | undefined;
    if (proofFileBuffer && proofFileName) {
      paymentProofUrl = await this.storageService.uploadPrivate(
        proofFileBuffer,
        `payment-proofs/${userId}/${Date.now()}-${proofFileName}`,
      );
    }

    const paymentMethod = dto.paymentMethod || ('BKASH' as any);
    const transactionId = dto.transactionId || (isFree ? 'FREE' : '');

    // Create order + access grant in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          contentItemId: content.id,
          pricePaid,
          paymentMethod,
          transactionId,
          paymentProofUrl,
          status: isFree ? OrderStatus.VERIFIED : OrderStatus.PENDING,
          verifiedAt: isFree ? new Date() : null,
        },
      });

      await tx.contentAccessGrant.create({
        data: {
          userId,
          contentItemId: content.id,
          orderId: newOrder.id,
          status: isFree ? AccessStatus.ACTIVE : AccessStatus.PENDING,
          activatedAt: isFree ? new Date() : null,
        },
      });

      return newOrder;
    });

    return {
      message: isFree
        ? 'বিনামূল্যের কোর্সে সফলভাবে এনরোল করা হয়েছে!'
        : 'অর্ডার গ্রহণ করা হয়েছে। আমাদের টিম যাচাই করার পর প্রবেশাধিকার দেওয়া হবে।',
      orderId: order.id,
      status: order.status,
    };
  }

  // ─── User: list own orders ───────────────────

  async getUserOrders(userId: string) {
    // Auto-verify any pending orders that have 0 price paid
    const pendingFreeOrders = await this.prisma.order.findMany({
      where: { userId, status: OrderStatus.PENDING, pricePaid: 0 },
      include: { accessGrant: true },
    });

    for (const pOrder of pendingFreeOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: pOrder.id },
          data: { status: OrderStatus.VERIFIED, verifiedAt: new Date() },
        });

        if (pOrder.accessGrant) {
          await tx.contentAccessGrant.update({
            where: { id: pOrder.accessGrant.id },
            data: { status: AccessStatus.ACTIVE, activatedAt: new Date() },
          });
        } else {
          await tx.contentAccessGrant.create({
            data: {
              userId: pOrder.userId,
              contentItemId: pOrder.contentItemId,
              orderId: pOrder.id,
              status: AccessStatus.ACTIVE,
              activatedAt: new Date(),
            },
          });
        }
      });
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        contentItem: {
          select: { id: true, titleBn: true, thumbnailUrl: true, type: true, slug: true },
        },
        accessGrant: {
          select: { status: true, activatedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      id: o.id,
      contentItem: o.contentItem,
      pricePaid: Number(o.pricePaid),
      paymentMethod: o.paymentMethod,
      transactionId: o.transactionId,
      status: o.status,
      adminNote: o.adminNote,
      accessGrant: o.accessGrant,
      createdAt: o.createdAt,
    }));
  }

  // ─── Admin: list all orders ──────────────────

  async getAllOrders(status?: OrderStatus, page = 1, limit = 20) {
    // Auto-verify pending 0-price orders
    const pendingFreeOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING, pricePaid: 0 },
      include: { accessGrant: true },
    });

    for (const pOrder of pendingFreeOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: pOrder.id },
          data: { status: OrderStatus.VERIFIED, verifiedAt: new Date() },
        });
        if (pOrder.accessGrant) {
          await tx.contentAccessGrant.update({
            where: { id: pOrder.accessGrant.id },
            data: { status: AccessStatus.ACTIVE, activatedAt: new Date() },
          });
        } else {
          await tx.contentAccessGrant.create({
            data: {
              userId: pOrder.userId,
              contentItemId: pOrder.contentItemId,
              orderId: pOrder.id,
              status: AccessStatus.ACTIVE,
              activatedAt: new Date(),
            },
          });
        }
      });
    }

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          contentItem: { select: { id: true, titleBn: true, type: true } },
          accessGrant: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Admin: get payment proof signed URL ─────

  async getPaymentProofUrl(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order?.paymentProofUrl) throw new NotFoundException('প্রমাণ পাওয়া যায়নি');

    // Generate a short-lived signed URL for the private proof image
    const signedUrl = await this.storageService.getSignedUrl(order.paymentProofUrl, 300); // 5 min
    return { url: signedUrl };
  }

  // ─── Admin: verify order → activate access ───

  async verifyOrder(orderId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        contentItem: { select: { id: true, titleBn: true } },
        accessGrant: true,
      },
    });

    if (!order) throw new NotFoundException('অর্ডার পাওয়া যায়নি');

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.VERIFIED,
          verifiedByAdminId: adminId,
          verifiedAt: new Date(),
        },
      });

      if (order.accessGrant) {
        await tx.contentAccessGrant.update({
          where: { id: order.accessGrant.id },
          data: { status: AccessStatus.ACTIVE, activatedAt: new Date(), grantedByAdminId: adminId },
        });
      } else {
        await tx.contentAccessGrant.upsert({
          where: {
            userId_contentItemId: {
              userId: order.userId,
              contentItemId: order.contentItemId,
            },
          },
          update: {
            status: AccessStatus.ACTIVE,
            activatedAt: new Date(),
            grantedByAdminId: adminId,
            orderId: order.id,
          },
          create: {
            userId: order.userId,
            contentItemId: order.contentItemId,
            orderId: order.id,
            status: AccessStatus.ACTIVE,
            activatedAt: new Date(),
            grantedByAdminId: adminId,
          },
        });
      }
    });

    // (Email notification can be added here if needed)

    return { message: 'অর্ডার যাচাই এবং প্রবেশাধিকার সক্রিয় করা হয়েছে' };
  }

  // ─── Admin: reject order ─────────────────────

  async rejectOrder(orderId: string, adminId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true } },
        contentItem: { select: { titleBn: true } },
        accessGrant: true,
      },
    });

    if (!order) throw new NotFoundException('অর্ডার পাওয়া যায়নি');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('এই অর্ডারটি ইতিমধ্যে প্রক্রিয়া করা হয়েছে');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REJECTED, adminNote: reason, verifiedByAdminId: adminId },
      });

      if (order.accessGrant) {
        await tx.contentAccessGrant.update({
          where: { id: order.accessGrant.id },
          data: { status: AccessStatus.REVOKED, revokeReason: reason },
        });
      }
    });

    // (Email notification can be added here if needed)

    return { message: 'অর্ডার প্রত্যাখ্যান করা হয়েছে' };
  }
}
