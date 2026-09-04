import {
  IsString,
  IsMobilePhone,
  MinLength,
  IsOptional,
  IsEmail,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OtpPurpose } from '@elearning/shared';

const BD_PHONE_REGEX = /^(?:\+88|88)?01[3-9]\d{8}$/;

export class RegisterDto {
  @ApiProperty({ example: '01712345678', description: 'Bangladesh mobile number' })
  @IsString()
  @Matches(BD_PHONE_REGEX, { message: 'সঠিক বাংলাদেশ মোবাইল নম্বর দিন (01XXXXXXXXX)' })
  phoneNumber: string;

  @ApiProperty({ example: 'MySecretPass123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' })
  password: string;

  @ApiProperty({ example: 'রাহেলা বেগম' })
  @IsString()
  @MinLength(2, { message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' })
  name: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'সঠিক ইমেইল ঠিকানা দিন' })
  email?: string;
}

export class LoginDto {
  @ApiProperty({ example: '01712345678' })
  @IsString()
  @Matches(BD_PHONE_REGEX, { message: 'সঠিক বাংলাদেশ মোবাইল নম্বর দিন' })
  phoneNumber: string;

  @ApiProperty({ example: 'MySecretPass123' })
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ description: 'Browser/device fingerprint for single-device tracking' })
  @IsString()
  deviceFingerprint: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '01712345678' })
  @IsString()
  @Matches(BD_PHONE_REGEX, { message: 'সঠিক বাংলাদেশ মোবাইল নম্বর দিন' })
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP অবশ্যই ৬ সংখ্যার হতে হবে' })
  otp: string;

  @ApiProperty({ enum: OtpPurpose })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @ApiPropertyOptional({ description: 'Required for LOGIN purpose' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  deviceFingerprint: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: '01712345678' })
  @IsString()
  @Matches(BD_PHONE_REGEX, { message: 'সঠিক বাংলাদেশ মোবাইল নম্বর দিন' })
  phoneNumber: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '01712345678' })
  @IsString()
  @Matches(BD_PHONE_REGEX)
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  otp: string;

  @ApiProperty({ example: 'MyNewPassword123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' })
  newPassword: string;
}
