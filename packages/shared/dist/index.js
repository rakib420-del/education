"use strict";
// ─────────────────────────────────────────────
// ENUMS (mirrors Prisma enums, framework-agnostic)
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_MERCHANT_NUMBERS = exports.PASSWORD_MIN_LENGTH = exports.BD_PHONE_REGEX = exports.AdminRole = exports.AccessStatus = exports.OrderStatusLabelBn = exports.OrderStatus = exports.PaymentMethodLabel = exports.PaymentMethod = exports.ContentLevelLabelBn = exports.ContentLevel = exports.ContentCategoryLabelBn = exports.ContentCategory = exports.ContentType = exports.OtpPurpose = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["BLOCKED"] = "BLOCKED";
    UserStatus["UNVERIFIED"] = "UNVERIFIED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["REGISTRATION"] = "REGISTRATION";
    OtpPurpose["LOGIN"] = "LOGIN";
    OtpPurpose["PASSWORD_RESET"] = "PASSWORD_RESET";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
var ContentType;
(function (ContentType) {
    ContentType["COURSE"] = "COURSE";
    ContentType["BOOK"] = "BOOK";
    ContentType["NOTE"] = "NOTE";
})(ContentType || (exports.ContentType = ContentType = {}));
var ContentCategory;
(function (ContentCategory) {
    ContentCategory["ADMISSION"] = "ADMISSION";
    ContentCategory["JOB_PREPARATION"] = "JOB_PREPARATION";
    ContentCategory["ACADEMIC"] = "ACADEMIC";
    ContentCategory["LANGUAGE"] = "LANGUAGE";
    ContentCategory["SKILLS"] = "SKILLS";
    ContentCategory["RELIGION"] = "RELIGION";
    ContentCategory["OTHER"] = "OTHER";
})(ContentCategory || (exports.ContentCategory = ContentCategory = {}));
exports.ContentCategoryLabelBn = {
    [ContentCategory.ADMISSION]: 'ভর্তি পরীক্ষা',
    [ContentCategory.JOB_PREPARATION]: 'চাকরি প্রস্তুতি',
    [ContentCategory.ACADEMIC]: 'একাডেমিক',
    [ContentCategory.LANGUAGE]: 'ভাষা শিক্ষা',
    [ContentCategory.SKILLS]: 'দক্ষতা উন্নয়ন',
    [ContentCategory.RELIGION]: 'ধর্মীয়',
    [ContentCategory.OTHER]: 'অন্যান্য',
};
var ContentLevel;
(function (ContentLevel) {
    ContentLevel["BEGINNER"] = "BEGINNER";
    ContentLevel["INTERMEDIATE"] = "INTERMEDIATE";
    ContentLevel["ADVANCED"] = "ADVANCED";
})(ContentLevel || (exports.ContentLevel = ContentLevel = {}));
exports.ContentLevelLabelBn = {
    [ContentLevel.BEGINNER]: 'প্রাথমিক',
    [ContentLevel.INTERMEDIATE]: 'মধ্যবর্তী',
    [ContentLevel.ADVANCED]: 'উন্নত',
};
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BKASH"] = "BKASH";
    PaymentMethod["NAGAD"] = "NAGAD";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
exports.PaymentMethodLabel = {
    [PaymentMethod.BKASH]: 'বিকাশ',
    [PaymentMethod.NAGAD]: 'নগদ',
};
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["VERIFIED"] = "VERIFIED";
    OrderStatus["REJECTED"] = "REJECTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
exports.OrderStatusLabelBn = {
    [OrderStatus.PENDING]: 'অপেক্ষামান',
    [OrderStatus.VERIFIED]: 'যাচাইকৃত',
    [OrderStatus.REJECTED]: 'প্রত্যাখ্যাত',
};
var AccessStatus;
(function (AccessStatus) {
    AccessStatus["PENDING"] = "PENDING";
    AccessStatus["ACTIVE"] = "ACTIVE";
    AccessStatus["REVOKED"] = "REVOKED";
})(AccessStatus || (exports.AccessStatus = AccessStatus = {}));
var AdminRole;
(function (AdminRole) {
    AdminRole["SUPERADMIN"] = "SUPERADMIN";
    AdminRole["MODERATOR"] = "MODERATOR";
})(AdminRole || (exports.AdminRole = AdminRole = {}));
// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
exports.BD_PHONE_REGEX = /^(?:\+88|88)?01[3-9]\d{8}$/;
exports.PASSWORD_MIN_LENGTH = 8;
exports.PAYMENT_MERCHANT_NUMBERS = {
    [PaymentMethod.BKASH]: '01XXXXXXXXX', // Replace with real merchant number
    [PaymentMethod.NAGAD]: '01XXXXXXXXX', // Replace with real merchant number
};
//# sourceMappingURL=index.js.map