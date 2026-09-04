import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService }     from './auth.service';
import { SessionGuard }    from './guards/session.guard';
import { CurrentUser }     from './decorators/current-user.decorator';
import { RegisterDto }     from './dto/register.dto';
import { LoginDto }        from './dto/login.dto';
import { VerifyOtpDto }    from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto }  from './dto/reset-password.dto';
import { ResendOtpDto }      from './dto/resend-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** POST /api/auth/register */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** POST /api/auth/login — validates password, sends OTP email */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** POST /api/auth/verify-otp — validates OTP, returns session token */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  /** POST /api/auth/forgot-password — sends password reset OTP */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /** POST /api/auth/reset-password — resets password using OTP */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /** POST /api/auth/resend-otp — sends a new OTP */
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  /** POST /api/auth/logout — clears activeSessionToken */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionGuard)
  logout(@CurrentUser() user: { id: string }) {
    return this.authService.logout(user.id);
  }

  /** GET /api/auth/me — returns current authenticated user */
  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.authService.getMe(user.id);
  }
}
