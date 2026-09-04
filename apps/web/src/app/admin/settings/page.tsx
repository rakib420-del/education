'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Save, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন').optional().or(z.literal('')),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে').optional().or(z.literal('')),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'নতুন পাসওয়ার্ড সেট করতে বর্তমান পাসওয়ার্ড প্রয়োজন',
  path: ['currentPassword']
});

type FormData = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const { admin, adminLogout } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: admin?.email || '',
      currentPassword: '',
      newPassword: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!data.email && !data.newPassword) {
      toast.error('আপডেট করার জন্য কোনো তথ্য প্রদান করা হয়নি');
      return;
    }

    setLoading(true);
    try {
      await api.adminUpdateProfile({
        email: data.email || undefined,
        currentPassword: data.currentPassword || undefined,
        newPassword: data.newPassword || undefined,
      });
      
      toast.success('অ্যাডমিন প্রোফাইল সফলভাবে আপডেট করা হয়েছে!');
      reset({ currentPassword: '', newPassword: '', email: data.email || admin?.email || '' });

      if (data.email && data.email !== admin?.email) {
        const updatedAdmin = { ...admin, email: data.email };
        localStorage.setItem('elearn_admin_user', JSON.stringify(updatedAdmin));
      }

      if (data.newPassword) {
        toast('পাসওয়ার্ড পরিবর্তন হয়েছে, সিকিউরিটির জন্য পুনরায় লগইন করুন', { icon: '🔒' });
        setTimeout(() => adminLogout(), 1500);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">অ্যাডমিন সেটিংস</h1>
        <p className="text-[#8b949e]">আপনার ইমেইল এবং পাসওয়ার্ড পরিবর্তন করুন</p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#c8d1da] mb-1.5" htmlFor="admin-email">
              নতুন ইমেইল ঠিকানা <span className="text-[#484f58] font-normal">(বর্তমান: {admin?.email})</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                id="admin-email"
                {...register('email')}
                className={`w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-1 focus:ring-[#ff7a45] focus:border-[#ff7a45] block pl-10 p-2.5 outline-none transition-colors ${errors.email ? 'border-[#f85149]' : ''}`}
                placeholder="নতুন ইমেইল দিন (যদি পরিবর্তন করতে চান)"
                type="email"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-[#f85149]">{errors.email.message}</p>}
          </div>

          <hr className="border-[#30363d]" />
          
          <h3 className="text-lg font-medium text-white">পাসওয়ার্ড পরিবর্তন</h3>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-[#c8d1da] mb-1.5" htmlFor="current-password">
              বর্তমান পাসওয়ার্ড <span className="text-[#484f58] font-normal">(পাসওয়ার্ড পরিবর্তন করতে এটি আবশ্যক)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                id="current-password"
                {...register('currentPassword')}
                type={showCurrentPass ? 'text' : 'password'}
                className={`w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-1 focus:ring-[#ff7a45] focus:border-[#ff7a45] block pl-10 pr-10 p-2.5 outline-none transition-colors ${errors.currentPassword ? 'border-[#f85149]' : ''}`}
                placeholder="আপনার বর্তমান পাসওয়ার্ড"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-xs text-[#f85149]">{errors.currentPassword.message}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-[#c8d1da] mb-1.5" htmlFor="new-password">
              নতুন পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
              <input
                id="new-password"
                {...register('newPassword')}
                type={showNewPass ? 'text' : 'password'}
                className={`w-full bg-[#0d1117] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg focus:ring-1 focus:ring-[#ff7a45] focus:border-[#ff7a45] block pl-10 pr-10 p-2.5 outline-none transition-colors ${errors.newPassword ? 'border-[#f85149]' : ''}`}
                placeholder="কমপক্ষে ৬ অক্ষর"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e]"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-xs text-[#f85149]">{errors.newPassword.message}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto px-6 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
