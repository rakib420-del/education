import { Controller, Get, Patch, Body, Param, UseGuards, Post, Delete } from '@nestjs/common';
import { UsersService }  from './users.service';
import { SessionGuard }  from '../auth/guards/session.guard';
import { CurrentUser }   from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(SessionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() body: { name?: string }) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Delete('me')
  deleteMe(@CurrentUser() user: any) {
    return this.usersService.deleteMe(user.id);
  }

  @Get('me/sessions')
  getSessions(@CurrentUser() user: any) {
    return this.usersService.getActiveSessions(user.id);
  }

  @Get('me/content')
  getMyContent(@CurrentUser() user: any) {
    return this.usersService.getMyContent(user.id);
  }

  @Get('me/progress/:lessonId')
  getLessonProgress(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.usersService.getLessonProgress(user.id, lessonId);
  }

  @Post('me/progress/:lessonId')
  updateProgress(
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
    @Body('watchedSeconds') watchedSeconds: number,
  ) {
    return this.usersService.updateLessonProgress(user.id, lessonId, watchedSeconds);
  }
}
