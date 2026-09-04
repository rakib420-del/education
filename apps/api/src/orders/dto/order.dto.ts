import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@elearning/shared';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentItemId: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 'TXN1234567890', description: 'bKash/Nagad transaction ID', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

