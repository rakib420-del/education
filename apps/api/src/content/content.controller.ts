import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, Optional,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ContentQueryDto, CreateContentDto, CreateLessonDto, CreateChapterDto, UpdateChapterDto } from './dto/content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalSessionGuard } from '../auth/guards/optional-session.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminJwtGuard } from '../admin/guards/admin-jwt.guard';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List published content (courses, books, notes)' })
  findAll(@Query() query: ContentQueryDto, @CurrentUser() user?: any) {
    return this.contentService.findAll(query, user?.sub);
  }

  @Get('affiliate')
  @ApiOperation({ summary: 'List active affiliate offers' })
  findAffiliateOffers() {
    return this.contentService.findAffiliateOffers();
  }

  @Post('affiliate/:id/click')
  @ApiOperation({ summary: 'Track affiliate offer click' })
  trackAffiliateClick(@Param('id') id: string) {
    return this.contentService.trackAffiliateClick(id);
  }

  @Get(':slug')
  @UseGuards(OptionalSessionGuard)
  @ApiOperation({ summary: 'Get content detail by slug' })
  findOne(@Param('slug') slug: string, @CurrentUser() user?: any) {
    return this.contentService.findBySlug(slug, user?.id || user?.sub);
  }

  // ─── Admin routes ────────────────────────────

  @Post('admin')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create new content item' })
  create(@Body() dto: CreateContentDto, @CurrentUser() admin: any) {
    return this.contentService.create(dto, admin.sub);
  }

  @Patch('admin/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update content item' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateContentDto>) {
    return this.contentService.update(id, dto);
  }

  @Post('admin/:id/lessons')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Add lesson to a course' })
  addLesson(@Param('id') id: string, @Body() dto: CreateLessonDto) {
    return this.contentService.addLesson(id, dto);
  }

  @Patch('admin/lessons/:lessonId')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update lesson' })
  updateLesson(@Param('lessonId') lessonId: string, @Body() dto: Partial<CreateLessonDto>) {
    return this.contentService.updateLesson(lessonId, dto);
  }

  @Delete('admin/lessons/:lessonId')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete lesson' })
  deleteLesson(@Param('lessonId') lessonId: string) {
    return this.contentService.deleteLesson(lessonId);
  }

  // ─── Admin Chapter / PDF routes ─────────────

  @Post('admin/:id/chapters')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Add chapter / PDF to a book or note' })
  addChapter(@Param('id') id: string, @Body() dto: CreateChapterDto) {
    return this.contentService.addChapter(id, dto);
  }

  @Patch('admin/chapters/:chapterId')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update chapter' })
  updateChapter(@Param('chapterId') chapterId: string, @Body() dto: UpdateChapterDto) {
    return this.contentService.updateChapter(chapterId, dto);
  }

  @Delete('admin/chapters/:chapterId')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete chapter' })
  deleteChapter(@Param('chapterId') chapterId: string) {
    return this.contentService.deleteChapter(chapterId);
  }

  @Delete('admin/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete content item' })
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
