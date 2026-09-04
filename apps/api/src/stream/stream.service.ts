import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { AccessStatus } from '@elearning/shared';

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name);
  private readonly apiKey: string;
  private readonly libraryId: string;
  private readonly cdnHostname: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.apiKey = configService.get<string>('BUNNY_STREAM_API_KEY', '');
    this.libraryId = configService.get<string>('BUNNY_STREAM_LIBRARY_ID', '');
    this.cdnHostname = configService.get<string>('BUNNY_CDN_HOSTNAME', '');
  }

  /**
   * Get an authenticated HLS stream URL for a lesson.
   * Verifies the user's access grant before returning the URL.
   * Logs access for watermark traceability.
   */
  async getLessonStreamUrl(
    lessonId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<{ hlsUrl: string; watermarkData: { name: string; phone: string } }> {
    // Fetch lesson + content item
    const lesson = await this.prisma.courseLesson.findUnique({
      where: { id: lessonId },
      include: { contentItem: true },
    });
    if (!lesson) throw new NotFoundException('পাঠ পাওয়া যায়নি');

    // Allow preview lessons without access check
    if (!lesson.isPreview) {
      if (!userId) {
        throw new ForbiddenException('এই পাঠে প্রবেশাধিকার নেই');
      }
      const grant = await this.prisma.contentAccessGrant.findFirst({
        where: {
          userId,
          contentItemId: lesson.contentItemId,
          status: AccessStatus.ACTIVE,
        },
      });
      if (!grant) {
        const order = await this.prisma.order.findFirst({
          where: {
            userId,
            contentItemId: lesson.contentItemId,
            status: 'VERIFIED',
          },
        });
        if (!order) {
          throw new ForbiddenException('এই পাঠে প্রবেশাধিকার নেই');
        }
      }
    }

    // Get user info for watermark
    let user: any = null;
    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, mobileNumber: true },
      });

      // Log watermark view
      await this.prisma.watermarkLog.create({
        data: {
          userId,
          contentItemId: lesson.contentItemId,
          lessonId,
          ipAddress: ipAddress || '',
        },
      });
    }

    // Build HLS URL
    let hlsUrl: string;

    const rawUrl = lesson.videoUrl || lesson.videoAssetId || '';

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      // Direct video URL or full Bunny stream link pasted by admin
      hlsUrl = rawUrl;
    } else if (rawUrl && this.apiKey) {
      // Bunny.net Stream Video GUID with signed token
      hlsUrl = await this.generateBunnySignedUrl(rawUrl);
    } else if (rawUrl && !this.apiKey) {
      // Bunny.net GUID present but no API key configured — construct public fallback URL
      hlsUrl = `https://iframe.mediadelivery.net/embed/${this.libraryId || '744097'}/${rawUrl}`;
    } else {
      // Direct MP4 sample stream for development
      hlsUrl = 'https://vjs.zencdn.net/v/oceans.mp4';
    }

    return {
      hlsUrl,
      watermarkData: {
        name: user?.name || '',
        phone: user?.mobileNumber || (user ? `ID: ${user.id.slice(0, 8)}` : ''),
      },
    };
  }

  /**
   * Upload a video to Bunny.net Stream library
   */
  async createVideoUploadUrl(title: string): Promise<{
    videoId: string;
    uploadUrl: string;
  }> {
    if (!this.apiKey || !this.libraryId) {
      this.logger.warn('Bunny.net credentials not configured — using mock');
      return {
        videoId: `mock-video-${Date.now()}`,
        uploadUrl: 'http://localhost:3001/api/stream/mock-upload',
      };
    }

    try {
      const response = await axios.post(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos`,
        { title },
        {
          headers: {
            AccessKey: this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        videoId: response.data.guid,
        uploadUrl: `https://video.bunnycdn.com/library/${this.libraryId}/videos/${response.data.guid}`,
      };
    } catch (error) {
      this.logger.error(`Bunny.net API error: ${(error as Error).message}`);
      throw new Error('ভিডিও আপলোড সেটআপ ব্যর্থ হয়েছে');
    }
  }

  /**
   * Generate a Bunny.net signed HLS URL with expiry
   * See: https://support.bunny.net/hc/en-us/articles/360016055099
   */
  private async generateBunnySignedUrl(videoGuid: string): Promise<string> {
    const crypto = await import('crypto');
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    const hostname = this.cdnHostname || `iframe.mediadelivery.net/embed/${this.libraryId || '744097'}`;

    if (!this.cdnHostname) {
      return `https://iframe.mediadelivery.net/embed/${this.libraryId || '744097'}/${videoGuid}`;
    }

    const cdnUrl = `https://${hostname}/${videoGuid}/playlist.m3u8`;
    const pathName = `/${videoGuid}/playlist.m3u8`;

    const hashBase = `${this.apiKey}${pathName}${expiry}`;
    const token = crypto
      .createHash('sha256')
      .update(hashBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${cdnUrl}?token=${token}&expires=${expiry}`;
  }

  /**
   * Get chapter PDF pages as image URLs (watermarked)
   * NOTE: In production, PDF→image rendering should be a background job (not per-request)
   */
  async getChapterPages(
    chapterId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<{ pdfUrl?: string; pages: string[]; watermarkData: { name: string; phone: string } }> {
    const chapter = await this.prisma.bookChapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter) throw new NotFoundException('অধ্যায় পাওয়া যায়নি');

    if (!chapter.isPreview) {
      if (!userId) {
        throw new ForbiddenException('এই অধ্যায়ে প্রবেশাধিকার নেই');
      }
      const grant = await this.prisma.contentAccessGrant.findFirst({
        where: {
          userId,
          contentItemId: chapter.contentItemId,
          status: AccessStatus.ACTIVE,
        },
      });
      if (!grant) {
        const order = await this.prisma.order.findFirst({
          where: {
            userId,
            contentItemId: chapter.contentItemId,
            status: 'VERIFIED',
          },
        });
        if (!order) {
          throw new ForbiddenException('এই অধ্যায়ে প্রবেশাধিকার নেই');
        }
      }
    }

    let user: any = null;
    if (userId) {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, mobileNumber: true },
      });

      // Log access
      await this.prisma.watermarkLog.create({
        data: {
          userId,
          contentItemId: chapter.contentItemId,
          chapterId,
          ipAddress: ipAddress || '',
        },
      });
    }

    let formattedPdfUrl = chapter.pdfAssetKey || undefined;
    if (formattedPdfUrl?.includes('drive.google.com')) {
      if (!formattedPdfUrl.includes('/preview')) {
        formattedPdfUrl = formattedPdfUrl.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
        if (!formattedPdfUrl.endsWith('/preview') && !formattedPdfUrl.includes('/preview')) {
          formattedPdfUrl = formattedPdfUrl.split('?')[0] + '/preview';
        }
      }
    }

    return {
      pdfUrl: formattedPdfUrl,
      pages: formattedPdfUrl ? [formattedPdfUrl] : [],
      watermarkData: {
        name: user?.name || '',
        phone: user?.mobileNumber || (user ? `ID: ${user.id.slice(0, 8)}` : ''),
      },
    };
  }
}
