'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, Lock, User, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  name:         z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  mobileNumber: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, 'সঠিক বাংলাদেশ মোবাইল নম্বর দিন'),
  email:        z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
  password:     z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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
      await api.register({
        email:        data.email,
        password:     data.password,
        name:         data.name,
        mobileNumber: data.mobileNumber,
      });
      toast.success('নিবন্ধন সফল! এখন লগইন করুন।');
      router.push('/login');
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message;
      const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : (rawMsg || err?.message || 'নিবন্ধন ব্যর্থ হয়েছে');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#ff7a45]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#ff7a45]/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-glow">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold font-bangla">শিক্ষা</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            আপনার শিক্ষার যাত্রা<br />
            <span className="gradient-text">আজই শুরু করুন</span>
          </h2>
          <p className="text-[#c8d1da] text-lg mb-10 leading-relaxed">
            বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্মে নিবন্ধন করুন।
          </p>
          <div className="space-y-4">
            {['মোবাইল পেমেন্ট সুবিধা', '২৪ ঘণ্টা অ্যাক্সেস', 'উন্নতমানের কনটেন্ট', 'সহজ নেভিগেশন'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-[#c8d1da]">
                <div className="w-5 h-5 rounded-full bg-[#ff7a45]/20 border border-[#ff7a45]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#ff7a45] text-xs">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-bangla">শিক্ষা</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">নিবন্ধন করুন</h1>
          <p className="text-[#8b949e] mb-8">আজই শুরু করুন আপনার শিক্ষার যাত্রা</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <label className="form-label" htmlFor="reg-name">পূর্ণ নাম</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="reg-name"
                  {...register('name')}
                  className={`form-input pl-10 ${errors.name ? 'error' : ''}`}
                  placeholder="আপনার পূর্ণ নাম"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-[#f85149]">{errors.name.message}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="form-label" htmlFor="reg-mobile">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="reg-mobile"
                  {...register('mobileNumber')}
                  className={`form-input pl-10 ${errors.mobileNumber ? 'error' : ''}`}
                  placeholder="01XXXXXXXXX"
                  autoComplete="tel"
                />
              </div>
              {errors.mobileNumber && <p className="mt-1 text-xs text-[#f85149]">{errors.mobileNumber.message}</p>}
            </div>

            {/* Email (required) */}
            <div>
              <label className="form-label" htmlFor="reg-email">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                <input
                  id="reg-password"
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  autoComplete="new-password"
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
              ) : 'নিবন্ধন করুন'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8b949e] mt-6">
            ইতিমধ্যে আকাউন্ট আছে?{' '}
            <Link href="/login" className="text-[#ff7a45] font-medium hover:underline">লগইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
