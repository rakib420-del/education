'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { api } from '@/lib/api-client';

const schema = z.object({
  newPassword: z.string().min(8, 'কমপক্ষে ৮ অক্ষর'),
  confirm:     z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'পাসওয়ার্ড মিলছে না', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const otp   = params.get('otp') || '';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.resetPassword({ email, code: otp, newPassword: data.newPassword });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে! এখন লগইন করুন।');
      router.push('/login');
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
            <Lock className="w-7 h-7 text-[#ff7a45]" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">নতুন পাসওয়ার্ড</h1>
          <p className="text-[#8b949e] text-center text-sm mb-8">আপনার নতুন পাসওয়ার্ড সেট করুন</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {[
              { id: 'new-pass',  label: 'নতুন পাসওয়ার্ড',    name: 'newPassword' as const, ph: 'কমপক্ষে ৮ অক্ষর' },
              { id: 'confirm',   label: 'পাসওয়ার্ড নিশ্চিত', name: 'confirm' as const,     ph: 'আবার লিখুন'     },
            ].map((f) => (
              <div key={f.id}>
                <label className="form-label" htmlFor={f.id}>{f.label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
                  <input
                    id={f.id}
                    {...register(f.name)}
                    type={showPass ? 'text' : 'password'}
                    className={`form-input pl-10 pr-10 ${errors[f.name] ? 'error' : ''}`}
                    placeholder={f.ph}
                  />
                  {f.name === 'newPassword' && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58]">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[f.name] && <p className="mt-1 text-xs text-[#f85149]">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
