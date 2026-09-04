import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsInt,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentCategory, ContentLevel } from '@elearning/shared';

export class CreateContentDto {
  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ example: 'এইচএসসি পদার্থবিজ্ঞান কোর্স' })
  @IsString()
  @MinLength(3)
  titleBn: string;

  @ApiPropertyOptional({ example: 'HSC Physics Course' })
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionBn?: string;

  @ApiProperty({ example: 'hsc-physics-course' })
  @IsString()
  slug: string;

  @ApiProperty({ enum: ContentCategory })
  @IsEnum(ContentCategory)
  category: ContentCategory;

  @ApiProperty({ enum: ContentLevel })
  @IsEnum(ContentLevel)
  level: ContentLevel;

  @ApiProperty({ example: 499 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 399 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateLessonDto {
  @ApiProperty({ example: 'অধ্যায় ১: গতি ও নিউটনের সূত্র' })
  @IsString()
  titleBn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Bunny.net video GUID' })
  @IsOptional()
  @IsString()
  videoAssetId?: string;

  @ApiPropertyOptional({ description: 'Direct video/stream URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class UpdateLessonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleBn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoAssetId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class CreateChapterDto {
  @ApiProperty({ example: 'অধ্যায় ১: ব্যাকরণের আলোচ্য বিষয়' })
  @IsString()
  titleBn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({ description: 'PDF Link or S3/Storage Key' })
  @IsOptional()
  @IsString()
  pdfAssetKey?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  pageCount?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class UpdateChapterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleBn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titleEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfAssetKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pageCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;
}

export class ContentQueryDto {
  @ApiPropertyOptional({ enum: ContentType })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiPropertyOptional({ enum: ContentCategory })
  @IsOptional()
  @IsEnum(ContentCategory)
  category?: ContentCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 12;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeUnpublished?: boolean;
}
