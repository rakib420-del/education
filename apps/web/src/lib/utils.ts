/**
 * Generate a lightweight browser fingerprint for single-device enforcement.
 * Not cryptographically unique, but sufficient for the use case.
 */
export function generateDeviceFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ].join('|');

  // Simple hash (djb2)
  let hash = 5381;
  for (let i = 0; i < components.length; i++) {
    hash = ((hash << 5) + hash) ^ components.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

export function getOrCreateFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr';
  let fp = localStorage.getItem('device_fp');
  if (!fp) {
    fp = generateDeviceFingerprint();
    localStorage.setItem('device_fp', fp);
  }
  return fp;
}

export function formatBDPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return '+' + digits;
  if (digits.startsWith('0')) return '+88' + digits;
  return '+88' + digits;
}

export function formatPrice(amount?: number | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '৳০';
  return '৳' + Number(amount).toLocaleString('bn-BD');
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'আজ';
  if (diffDays === 1) return 'গতকাল';
  if (diffDays < 7) return `${diffDays} দিন আগে`;
  return d.toLocaleDateString('bn-BD');
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
