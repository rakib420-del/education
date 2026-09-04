import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService }  from '../mailer/mailer.service';
import { RegisterDto }    from './dto/register.dto';
import { LoginDto }       from './dto/login.dto';
import { VerifyOtpDto }   from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:  PrismaService,
    private readonly mailer:  MailerService,
  ) {}

  // ── Register ───────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email:        dto.email.toLowerCase(),
        passwordHash,
        name:         dto.name.trim(),
        mobileNumber: dto.mobileNumber,
      },
      select: { id: true, email: true, name: true, mobileNumber: true, createdAt: true },
    });

    return { message: 'Account created. You can now log in.', user };
  }

  // ── Login (sends OTP) ──────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.isBlocked) throw new UnauthorizedException('এই অ্যাকাউন্টটি ব্লক করা হয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।');

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw new UnauthorizedException('Invalid email or password');

    // Invalidate any existing unused OTPs for this user
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    // Generate a 6-digit OTP
    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: { userId: user.id, code, expiresAt },
    });

    // Send OTP via email (falls back to console log if SMTP not configured)
    await this.mailer.sendOtp(user.email, code);

    return { message: 'OTP sent to your email. Valid for 5 minutes.' };
  }

  // ── Verify OTP → returns session token ────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.isBlocked) throw new UnauthorizedException('এই অ্যাকাউন্টটি ব্লক করা হয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।');

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code:   dto.code,
        used:   false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired. Please log in again.');
    }

    // Mark OTP used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data:  { used: true },
    });

    // Generate a new session token and OVERWRITE the existing one
    // → any previously active session is automatically invalidated
    const sessionToken = randomBytes(48).toString('hex');

    const deviceFingerprint = dto.deviceFingerprint || 'unknown-device';
    let userDevice = await this.prisma.userDevice.findFirst({
      where: { userId: user.id, deviceFingerprint },
    });

    if (userDevice) {
      if (userDevice.isBlocked) {
        throw new UnauthorizedException('এই ডিভাইসটি ব্লক করা হয়েছে'); // This device is blocked
      }
      await this.prisma.userDevice.update({
        where: { id: userDevice.id },
        data: { lastLoginAt: new Date(), userAgent: dto.userAgent },
      });
    } else {
      await this.prisma.userDevice.create({
        data: {
          userId: user.id,
          deviceFingerprint,
          userAgent: dto.userAgent,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { activeSessionToken: sessionToken },
    });

    return {
      message: 'Login successful',
      token:   sessionToken,
      user: {
        id:           user.id,
        email:        user.email,
        name:         user.name,
        mobileNumber: user.mobileNumber,
        createdAt:    user.createdAt,
      },
    };
  }

  // ── Forgot Password (sends OTP) ────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: { userId: user.id, code, expiresAt },
    });

    await this.mailer.sendOtp(user.email, code);

    return { message: 'Password reset OTP sent to your email.' };
  }

  // ── Resend OTP ──────────────────────────────────────────────────────
  async resendOtp(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, used: false },
      data:  { used: true },
    });

    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.otpCode.create({
      data: { userId: user.id, code, expiresAt },
    });

    await this.mailer.sendOtp(user.email, code);

    return { message: 'A new OTP has been sent to your email.' };
  }

  // ── Reset Password ──────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException('User not found');

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code:   dto.code,
        used:   false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data:  { used: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data:  { passwordHash },
      }),
    ]);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  // ── Logout ─────────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data:  { activeSessionToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  // ── Get current user profile ───────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
