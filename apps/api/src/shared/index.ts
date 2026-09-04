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

