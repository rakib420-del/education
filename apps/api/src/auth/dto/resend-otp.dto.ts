import { IsEmail } from 'class-validator';

export class ResendOtpDto {
  @IsEmail({}, { message: 'Valid email required' })
  email: string;
}
