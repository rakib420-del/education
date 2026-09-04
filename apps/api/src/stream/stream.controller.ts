import { Controller, Get, Post, Param, Req, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { StreamService } from './stream.service';
import { SessionGuard } from '../auth/guards/session.guard';
import { OptionalSessionGuard } from '../auth/guards/optional-session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Stream')
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('lesson/:lessonId')
  @UseGuards(OptionalSessionGuard)
  @ApiOperation({ summary: 'Get signed HLS stream URL for a lesson (access-gated)' })
  getLessonUrl(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    return this.streamService.getLessonStreamUrl(lessonId, user?.id || user?.sub, ip);
  }

  @Get('chapter/:chapterId/pages')
  @UseGuards(OptionalSessionGuard)
  @ApiOperation({ summary: 'Get watermarked page image URLs for a book chapter (access-gated)' })
  getChapterPages(
    @Param('chapterId') chapterId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
    return this.streamService.getChapterPages(chapterId, user?.id || user?.sub, ip);
  }

  @Post('upload-url')
  @ApiOperation({ summary: '[Admin] Get Bunny.net video upload URL' })
  createUploadUrl(@Body('title') title: string) {
    return this.streamService.createVideoUploadUrl(title);
  }
}
