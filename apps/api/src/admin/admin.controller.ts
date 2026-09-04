import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Auth ────────────────────────────────────

  @Post('login')
  @ApiOperation({ summary: 'Admin login (email + password)' })
  login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  // ─── Profile ─────────────────────────────────

  @Patch('profile')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin email or password' })
  updateProfile(
    @CurrentUser() admin: any,
    @Body() body: { email?: string; currentPassword?: string; newPassword?: string },
  ) {
    return this.adminService.updateCredentials(admin.sub, body);
  }

  // ─── Dashboard ───────────────────────────────

  @Get('dashboard')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ─── Users ───────────────────────────────────

  @Get('users')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users with pagination' })
  listUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(page, limit, search);
  }

  @Patch('users/:id/block')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Block user + invalidate all sessions' })
  blockUser(@Param('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Patch('users/:id/unblock')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Patch('users/:id/force-logout')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Force logout all sessions for a user' })
  forceLogout(@Param('id') id: string) {
    return this.adminService.forceLogoutUser(id);
  }

  @Delete('users/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user account' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('users/:id/devices')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get devices used by user' })
  getUserDevices(@Param('id') id: string) {
    return this.adminService.getUserDevices(id);
  }

  @Patch('users/devices/:deviceId/block')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Block user device' })
  blockDevice(@Param('deviceId') deviceId: string) {
    return this.adminService.blockDevice(deviceId);
  }

  @Patch('users/devices/:deviceId/unblock')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unblock user device' })
  unblockDevice(@Param('deviceId') deviceId: string) {
    return this.adminService.unblockDevice(deviceId);
  }

  // ─── Access management ───────────────────────

  @Get('access-grants')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all content access grants' })
  listAccessGrants(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.listAccessGrants(status, page, limit);
  }

  @Post('access/grant')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually grant content access to a user' })
  grantAccess(
    @Body() body: { userId: string; contentItemId: string },
    @CurrentUser() admin: any,
  ) {
    return this.adminService.grantAccess(body.userId, body.contentItemId, admin.sub);
  }

  @Post('access/revoke')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke content access from a user' })
  revokeAccess(
    @Body() body: { userId: string; contentItemId: string; reason?: string },
  ) {
    return this.adminService.revokeAccess(body.userId, body.contentItemId, body.reason);
  }

  // ─── Affiliate offers ────────────────────────

  @Post('affiliate')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create affiliate offer' })
  createAffiliate(@Body() body: any) {
    return this.adminService.createAffiliateOffer(body);
  }

  @Patch('affiliate/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update affiliate offer' })
  updateAffiliate(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAffiliateOffer(id, body);
  }

  @Delete('affiliate/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete affiliate offer' })
  deleteAffiliate(@Param('id') id: string) {
    return this.adminService.deleteAffiliateOffer(id);
  }
}
