'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, ShoppingBag, BookOpen, TrendingUp,
  Clock, CheckCircle, XCircle, ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface Stats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  verifiedOrders: number;
  totalContent: number;
  totalRevenue: number;
}

function StatCard({
  label, value, icon: Icon, color, href, loading,
}: {
  label: string; value: string | number; icon: any;
  color: string; href?: string; loading: boolean;
}) {
  const inner = (
    <div className="admin-stat-card group hover:border-[var(--border)] transition-all duration-300 relative overflow-hidden"
      style={{ borderColor: 'transparent', '--hover-color': color } as any}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: color + '18' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {href && (
            <ArrowRight className="w-4 h-4 text-[#484f58] group-hover:text-[#8b949e] group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
        {loading ? (
          <div className="h-9 w-20 shimmer rounded-lg mb-1" />
        ) : (
          <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
        )}
        <p className="text-sm text-[#8b949e]">{label}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">{inner}</Link>
  ) : (
    <div>{inner}</div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'সক্রিয় ব্যবহারকারী',
      value: stats?.totalUsers?.toLocaleString('bn-BD') ?? '—',
      icon: Users, color: '#3fb950', href: '/admin/users',
    },
    {
      label: 'মোট অর্ডার',
      value: stats?.totalOrders?.toLocaleString('bn-BD') ?? '—',
      icon: ShoppingBag, color: '#ff7a45', href: '/admin/orders',
    },
    {
      label: 'অপেক্ষামান অর্ডার',
      value: stats?.pendingOrders?.toLocaleString('bn-BD') ?? '—',
      icon: Clock, color: '#d29922', href: '/admin/orders?status=PENDING',
    },
    {
      label: 'যাচাইকৃত অর্ডার',
      value: stats?.verifiedOrders?.toLocaleString('bn-BD') ?? '—',
      icon: CheckCircle, color: '#58a6ff', href: '/admin/orders?status=VERIFIED',
    },
    {
      label: 'প্রকাশিত কনটেন্ট',
      value: stats?.totalContent?.toLocaleString('bn-BD') ?? '—',
      icon: BookOpen, color: '#bc8cff', href: '/admin/content',
    },
    {
      label: 'মোট রাজস্ব',
      value: stats ? `৳${Number(stats.totalRevenue).toLocaleString('bn-BD')}` : '—',
      icon: TrendingUp, color: '#3fb950',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">ড্যাশবোর্ড</h1>
        <p className="text-sm text-[#8b949e]">প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Quick action links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#ff7a45]" />
            দ্রুত অ্যাকশন
          </h2>
          <div className="space-y-2">
            {[
              { href: '/admin/orders?status=PENDING', label: 'অপেক্ষামান অর্ডার যাচাই করুন', color: '#d29922' },
              { href: '/admin/content',               label: 'নতুন কোর্স/বই যোগ করুন',       color: '#ff7a45' },
              { href: '/admin/users',                  label: 'ব্যবহারকারী পরিচালনা',          color: '#3fb950' },
              { href: '/admin/affiliate',              label: 'অ্যাফিলিয়েট অফার পরিচালনা',    color: '#bc8cff' },
            ].map(({ href, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-sm text-[#c8d1da] group-hover:text-white transition-colors">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-[#484f58] group-hover:text-[#8b949e] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3fb950]" />
            অর্ডার সারাংশ
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 shimmer rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'অপেক্ষামান',   value: stats?.pendingOrders,   color: '#d29922', bg: 'rgba(210,153,34,0.1)' },
                { label: 'যাচাইকৃত',     value: stats?.verifiedOrders,  color: '#3fb950', bg: 'rgba(63,185,80,0.1)'  },
                { label: 'মোট',           value: stats?.totalOrders,     color: '#58a6ff', bg: 'rgba(88,166,255,0.1)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: bg }}>
                  <span className="text-sm font-medium" style={{ color }}>{label}</span>
                  <span className="text-base font-bold text-white">
                    {value?.toLocaleString('bn-BD') ?? '০'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
