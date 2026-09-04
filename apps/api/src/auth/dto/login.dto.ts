import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Valid email required' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
