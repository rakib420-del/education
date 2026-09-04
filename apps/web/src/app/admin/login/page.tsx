'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAdminAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { data } = await api.adminLogin({ email, password });
      adminLogin(data.accessToken, data.admin);
      toast.success('অ্যাডমিন লগইন সফল!');
      router.replace('/admin/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'লগইন ব্যর্থ হয়েছে';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#090d13]">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff7a45]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#e8612a] flex items-center justify-center shadow-[0_0_40px_rgba(255,122,69,0.3)] mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">অ্যাডমিন লগইন</h1>
          <p className="text-sm text-[#8b949e] mt-1">শিক্ষা ম্যানেজমেন্ট প্যানেল</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-5"
        >
          {/* Email */}
          <div>
            <label className="form-label" htmlFor="admin-email">ইমেইল</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="form-label" htmlFor="admin-password">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                className="form-input pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                প্রবেশ করা হচ্ছে...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                লগইন করুন
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#484f58] mt-6">
          শিক্ষা প্ল্যাটফর্ম · অ্যাডমিন পোর্টাল
        </p>
      </div>
    </div>
  );
}
