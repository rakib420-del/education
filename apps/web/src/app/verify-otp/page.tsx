'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const OTP_RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const email = params.get('email') || '';
  const purpose = params.get('purpose');

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(OTP_RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email in URL
  useEffect(() => {
    if (!email) router.replace('/login');
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCountdown]);

  // Auto-focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(Boolean) && next.join('').length === 6) submitOtp(next.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = Array(6).fill('');
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) submitOtp(text);
  };

  const submitOtp = useCallback(
    async (code: string) => {
      if (code.length !== 6 || loading) return;
      setLoading(true);
      try {
        if (purpose === 'PASSWORD_RESET') {
          router.replace(`/reset-password?email=${encodeURIComponent(email)}&otp=${code}`);
          return;
        }

        const { data } = await api.verifyOtp({ email, code });
        // Store session token
        login(data.token, data.user);
        toast.success('লগইন সফল!');
        router.replace('/dashboard');
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'OTP সঠিক নয়';
        toast.error(msg);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email, loading, login, router, purpose],
  );

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      await api.resendOtp({ email });
      toast.success('নতুন OTP পাঠানো হয়েছে!');
      setResendCountdown(OTP_RESEND_SECONDS);
    } catch {
      toast.error('পাঠাতে ব্যর্থ হয়েছে');
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length))
    : 'your@email.com';
  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8 md:p-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">OTP যাচাই করুন</h1>
          <p className="text-[#8b949e] text-center text-sm mb-1">
            আপনার ইমেইলে একটি ৬-সংখ্যার কোড পাঠানো হয়েছে
          </p>
          <p className="text-[#ff7a45] text-center text-sm font-medium mb-8">{maskedEmail}</p>

          {/* OTP inputs */}
          <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-input"
                disabled={loading}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-[#30363d] mb-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-gradient transition-all duration-300"
              style={{ width: `${(filled / 6) * 100}%` }}
            />
          </div>

          <button
            onClick={() => submitOtp(otp.join(''))}
            disabled={filled !== 6 || loading}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                যাচাই হচ্ছে...
              </span>
            ) : 'যাচাই করুন'}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {resendCountdown > 0 ? (
              <p className="text-sm text-[#8b949e]">
                <span className="text-white font-semibold">{resendCountdown}</span> সেকেন্ড পরে পুনরায় পাঠান
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="flex items-center gap-1.5 text-sm text-[#ff7a45] hover:underline mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                পুনরায় পাঠান
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
