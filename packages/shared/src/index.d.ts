export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED",
    UNVERIFIED = "UNVERIFIED"
}
export declare enum OtpPurpose {
    REGISTRATION = "REGISTRATION",
    LOGIN = "LOGIN",
    PASSWORD_RESET = "PASSWORD_RESET"
}
export declare enum ContentType {
    COURSE = "COURSE",
    BOOK = "BOOK",
    NOTE = "NOTE"
}
export declare enum ContentCategory {
    ADMISSION = "ADMISSION",
    JOB_PREPARATION = "JOB_PREPARATION",
    ACADEMIC = "ACADEMIC",
    LANGUAGE = "LANGUAGE",
    SKILLS = "SKILLS",
    RELIGION = "RELIGION",
    OTHER = "OTHER"
}
export declare const ContentCategoryLabelBn: Record<ContentCategory, string>;
export declare enum ContentLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare const ContentLevelLabelBn: Record<ContentLevel, string>;
export declare enum PaymentMethod {
    BKASH = "BKASH",
    NAGAD = "NAGAD"
}
export declare const PaymentMethodLabel: Record<PaymentMethod, string>;
export declare enum OrderStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare const OrderStatusLabelBn: Record<OrderStatus, string>;
export declare enum AccessStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    REVOKED = "REVOKED"
}
export declare enum AdminRole {
    SUPERADMIN = "SUPERADMIN",
    MODERATOR = "MODERATOR"
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
export interface RegisterDto {
    phoneNumber: string;
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
    videoUrl?: string;
}
export interface BookChapterDto {
    id: string;
    titleBn: string;
    orderIndex: number;
    pageCount?: number;
    isPreview: boolean;
}
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
export declare const BD_PHONE_REGEX: RegExp;
export declare const PASSWORD_MIN_LENGTH = 8;
export declare const PAYMENT_MERCHANT_NUMBERS: Record<PaymentMethod, string>;
