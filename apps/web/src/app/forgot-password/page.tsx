'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, KeyRound } from 'lucide-react';
import { api } from '@/lib/api-client';

const forgotSchema = z.object({
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
});
const resetSchema = z.object({
  newPassword: z.string().min(8, 'কমপক্ষে ৮ অক্ষর'),
  confirm:     z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'পাসওয়ার্ড মিলছে না', path: ['confirm'] });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await api.forgotPassword({ email: data.email });
      toast.success('OTP পাঠানো হয়েছে!');
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&purpose=PASSWORD_RESET`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="glass-card p-8 md:p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#ff7a45]/10 border border-[#ff7a45]/20 flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-7 h-7 text-[#ff7a45]" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">পাসওয়ার্ড পুনরুদ্ধার</h1>
          <p className="text-[#8b949e] text-center text-sm mb-8">আপনার ইমেইল ঠিকানা দিন, OTP পাঠানো হবে</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="form-label" htmlFor="forgot-email">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="forgot-email"
                  {...register('email')}
                  className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[#f85149]">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading
                ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />পাঠানো হচ্ছে...</span>
                : 'OTP পাঠান'}
            </button>
          </form>
          <p className="text-center text-sm text-[#8b949e] mt-6">
            <Link href="/login" className="text-[#ff7a45] hover:underline">← লগইনে ফিরুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
