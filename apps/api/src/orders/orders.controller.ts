import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { OrdersService }  from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { SessionGuard }   from '../auth/guards/session.guard';
import { AdminJwtGuard }  from '../admin/guards/admin-jwt.guard';
import { CurrentUser }    from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrderStatus }    from '@elearning/shared';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor('paymentProof', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async createOrder(
    @CurrentUser() user: any,
    @Body() dto: CreateOrderDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.ordersService.createOrder(user.id, dto, file?.buffer, file?.originalname);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.getUserOrders(user.id);
  }

  // ─── Admin routes ────────────────────────────

  @Get('admin')
  @UseGuards(AdminJwtGuard)
  getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getAllOrders(status, page, limit);
  }

  @Get('admin/:id/proof')
  @UseGuards(AdminJwtGuard)
  getPaymentProof(@Param('id') id: string) {
    return this.ordersService.getPaymentProofUrl(id);
  }

  @Patch('admin/:id/verify')
  @UseGuards(AdminJwtGuard)
  verifyOrder(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.ordersService.verifyOrder(id, admin.sub);
  }

  @Patch('admin/:id/reject')
  @UseGuards(AdminJwtGuard)
  rejectOrder(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.rejectOrder(id, admin.sub, reason);
  }
}
