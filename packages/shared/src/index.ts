// ─────────────────────────────────────────────
// ENUMS (mirrors Prisma enums, framework-agnostic)
// ─────────────────────────────────────────────

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  UNVERIFIED = 'UNVERIFIED',
}

export enum OtpPurpose {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export enum ContentType {
  COURSE = 'COURSE',
  BOOK = 'BOOK',
  NOTE = 'NOTE',
}

export enum ContentCategory {
  ADMISSION = 'ADMISSION',
  JOB_PREPARATION = 'JOB_PREPARATION',
  ACADEMIC = 'ACADEMIC',
  LANGUAGE = 'LANGUAGE',
  SKILLS = 'SKILLS',
  RELIGION = 'RELIGION',
  OTHER = 'OTHER',
}

export const ContentCategoryLabelBn: Record<ContentCategory, string> = {
  [ContentCategory.ADMISSION]: 'ভর্তি পরীক্ষা',
  [ContentCategory.JOB_PREPARATION]: 'চাকরি প্রস্তুতি',
  [ContentCategory.ACADEMIC]: 'একাডেমিক',
  [ContentCategory.LANGUAGE]: 'ভাষা শিক্ষা',
  [ContentCategory.SKILLS]: 'দক্ষতা উন্নয়ন',
  [ContentCategory.RELIGION]: 'ধর্মীয়',
  [ContentCategory.OTHER]: 'অন্যান্য',
};

export enum ContentLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export const ContentLevelLabelBn: Record<ContentLevel, string> = {
  [ContentLevel.BEGINNER]: 'প্রাথমিক',
  [ContentLevel.INTERMEDIATE]: 'মধ্যবর্তী',
  [ContentLevel.ADVANCED]: 'উন্নত',
};

export enum PaymentMethod {
  BKASH = 'BKASH',
  NAGAD = 'NAGAD',
}

export const PaymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.BKASH]: 'বিকাশ',
  [PaymentMethod.NAGAD]: 'নগদ',
};

export enum OrderStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export const OrderStatusLabelBn: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'অপেক্ষামান',
  [OrderStatus.VERIFIED]: 'যাচাইকৃত',
  [OrderStatus.REJECTED]: 'প্রত্যাখ্যাত',
};

export enum AccessStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export enum AdminRole {
  SUPERADMIN = 'SUPERADMIN',
  MODERATOR = 'MODERATOR',
}

// ─────────────────────────────────────────────
// API RESPONSE TYPES
// ─────────────────────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// AUTH DTOs
// ─────────────────────────────────────────────

export interface RegisterDto {
  phoneNumber: string; // BD format: 01XXXXXXXXX
  password: string;
  name: string;
  email?: string;
}

export interface LoginDto {
  phoneNumber: string;
  password: string;
  deviceFingerprint: string;
}

export interface VerifyOtpDto {
  phoneNumber: string;
  otp: string;
  purpose: OtpPurpose;
  deviceFingerprint?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  status: UserStatus;
  createdAt: string;
}

// ─────────────────────────────────────────────
// CONTENT DTOs
// ─────────────────────────────────────────────

export interface ContentItemDto {
  id: string;
  type: ContentType;
  titleBn: string;
  titleEn?: string;
  descriptionBn?: string;
  slug: string;
  category: ContentCategory;
  level: ContentLevel;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  lessonCount?: number;
  chapterCount?: number;
  reviewCount?: number;
  averageRating?: number;
  enrollmentCount?: number;
}

export interface CourseLessonDto {
  id: string;
  titleBn: string;
  orderIndex: number;
  durationSeconds?: number;
  isPreview: boolean;
  videoUrl?: string; // only for preview or authenticated+granted users
}

export interface BookChapterDto {
  id: string;
  titleBn: string;
  orderIndex: number;
  pageCount?: number;
  isPreview: boolean;
}

// ─────────────────────────────────────────────
// ORDER DTOs
// ─────────────────────────────────────────────

export interface CreateOrderDto {
  contentItemId: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
}

export interface OrderDto {
  id: string;
  contentItem: Pick<ContentItemDto, 'id' | 'titleBn' | 'thumbnailUrl' | 'type'>;
  pricePaid: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: OrderStatus;
  adminNote?: string;
  accessGrant?: {
    status: AccessStatus;
    activatedAt?: string;
  };
  createdAt: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const BD_PHONE_REGEX = /^(?:\+88|88)?01[3-9]\d{8}$/;
export const PASSWORD_MIN_LENGTH = 8;

export const PAYMENT_MERCHANT_NUMBERS: Record<PaymentMethod, string> = {
  [PaymentMethod.BKASH]: '01XXXXXXXXX',   // Replace with real merchant number
  [PaymentMethod.NAGAD]: '01XXXXXXXXX',   // Replace with real merchant number
};
