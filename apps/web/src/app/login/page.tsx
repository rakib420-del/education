'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  email:    z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
  password: z.string().min(1, 'পাসওয়ার্ড দিন'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.login({ email: data.email, password: data.password });
      toast.success('OTP পাঠানো হয়েছে আপনার ইমেইলে!');
      // Pass email so verify-otp page can pre-fill it
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'লগইন ব্যর্থ হয়েছে';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-bangla">শিক্ষা</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">লগইন করুন</h1>
          <p className="text-[#8b949e] mb-8 text-sm">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="login-email">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="login-email"
                  {...register('email')}
                  className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                  placeholder="email@example.com"
                  type="email"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[#f85149]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label !mb-0" htmlFor="login-password">পাসওয়ার্ড</label>
                <Link href="/forgot-password" className="text-xs text-[#ff7a45] hover:underline">
                  ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="login-password"
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                  placeholder="পাসওয়ার্ড"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-[#f85149]">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  অপেক্ষা করুন...
                </span>
              ) : 'লগইন করুন'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b949e] mt-6">
            অ্যাকাউন্ট নেই?{' '}
            <Link href="/register" className="text-[#ff7a45] font-medium hover:underline">নিবন্ধন করুন</Link>
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-[#484f58]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
            নিরাপদ লগইন
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
            ইমেইল OTP যাচাই
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#3fb950] rounded-full" />
            সিঙ্গেল ডিভাইস সুরক্ষা
          </span>
        </div>
      </div>
    </div>
  );
}
