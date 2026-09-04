'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api-client';

const schema = z.object({
  name:  z.string().min(2, 'নামের দৈর্ঘ্য অন্তত ২ অক্ষর হতে হবে'),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  user?.name || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: updated } = await api.updateProfile(data);
      // Keep session alive with fresh details
      const cookies = require('js-cookie');
      const token = cookies.get('at') || '';
      login(token, updated);
      toast.success('প্রোফাইল তথ্য আপডেট করা হয়েছে!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">প্রোফাইল তথ্য</h1>
        <p className="text-[#8b949e] text-sm">আপনার ব্যক্তিগত অ্যাকাউন্টের বিবরণ পরিচালনা করুন</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Student ID */}
          <div>
            <label className="form-label">স্টুডেন্ট ID / User ID</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={user?.id || ''}
                className="form-input text-sm font-mono text-[#ff7a45] font-bold bg-[#ff7a45]/10 border-[#ff7a45]/30 cursor-text select-all"
              />
            </div>
            <p className="text-xs text-[#8b949e] mt-1">অ্যাডমিন থেকে অ্যাক্সেস পাওয়ার জন্য এই ID টি ব্যবহার করুন</p>
          </div>
          {/* Phone (readonly) */}
          <div>
            <label className="form-label">মোবাইল নম্বর (পরিবর্তনযোগ্য নয়)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="text"
                disabled
                value={(user as any)?.mobileNumber || (user as any)?.phoneNumber || 'ফোন নম্বর সংযুক্ত নেই'}
                className="form-input pl-10 text-white font-mono cursor-not-allowed bg-black/40 border-[#30363d]"
              />
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3fb950]" />
            </div>
            <p className="text-xs text-[#484f58] mt-1">মোবাইল নম্বর দিয়ে OTP অ্যাকাউন্ট সুরক্ষিত</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="form-label" htmlFor="profile-name">পূর্ণ নাম</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                id="profile-name"
                {...register('name')}
                className={`form-input pl-10 ${errors.name ? 'error' : ''}`}
                placeholder="আপনার নাম লিখুন"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-[#f85149]">{errors.name.message}</p>}
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="form-label">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="form-input pl-10 opacity-60 cursor-not-allowed bg-black/20"
              />
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3fb950]" />
            </div>
            <p className="text-xs text-[#484f58] mt-1">ইমেইল ঠিকানা দিয়ে অ্যাকাউন্ট সুরক্ষিত</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
