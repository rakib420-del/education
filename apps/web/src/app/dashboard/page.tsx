'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api-client';
import { BookOpen, GraduationCap, ShoppingBag, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { OrderStatus } from '@elearning/shared';

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const pOrders = api.getMyOrders()
      .then((res) => { if (mounted) setOrders(Array.isArray(res.data) ? res.data : []); })
      .catch(() => {});

    const pContent = api.getMyContent()
      .then((res) => { if (mounted) setContent(Array.isArray(res.data) ? res.data : []); })
      .catch(() => {});

    Promise.allSettled([pOrders, pContent]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
  const activeContent = content.length;
  const totalOrders   = orders.length;

  const stats = [
    { label: 'সক্রিয় কোর্স/বই', value: activeContent, icon: GraduationCap, color: '#ff7a45', href: '/dashboard/my-courses' },
    { label: 'মোট অর্ডার',      value: totalOrders,   icon: ShoppingBag,   color: '#3fb950', href: '/dashboard/orders'    },
    { label: 'অপেক্ষামান অর্ডার',value: pendingOrders, icon: Clock,         color: '#d29922', href: '/dashboard/orders'    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          স্বাগতম, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-[#8b949e]">আপনার শিক্ষার যাত্রা দেখুন</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-stat-card hover:border-[#ff7a45]/30 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '20' }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <ArrowRight className="w-4 h-4 text-[#484f58] group-hover:text-[#ff7a45] transition-colors" />
            </div>
            <p className="text-3xl font-extrabold text-white mb-1">
              {loading ? <span className="shimmer inline-block w-8 h-7 rounded" /> : s.value}
            </p>
            <p className="text-sm text-[#8b949e]">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My active courses */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#ff7a45]" /> সক্রিয় কোর্স
            </h2>
            <Link href="/dashboard/my-courses" className="text-xs text-[#ff7a45] hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-14 shimmer rounded-xl"/>)}</div>
          ) : content.slice(0,3).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#484f58] text-sm mb-3">কোনো কোর্স নেই</p>
              <Link href="/courses" className="btn-primary text-sm px-4 py-2">কোর্স দেখুন</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {content.slice(0,3).map((item: any) => (
                <Link
                  key={item.contentItem.id}
                  href={`/learn/${item.contentItem.slug || item.contentItem.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#ff7a45]/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-[#ff7a45]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e6edf3] truncate group-hover:text-white">{item.contentItem.titleBn}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-[#30363d] overflow-hidden">
                        <div className="h-full bg-[#ff7a45] rounded-full" style={{ width: `${Math.min(((item.progress || 0) / (item.contentItem._count?.lessons || 1)) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] text-[#484f58]">{item.progress || 0}/{item.contentItem._count?.lessons || 0} পাঠ</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#484f58] group-hover:text-[#ff7a45] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#3fb950]" /> সাম্প্রতিক অর্ডার
            </h2>
            <Link href="/dashboard/orders" className="text-xs text-[#ff7a45] hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-14 shimmer rounded-xl"/>)}</div>
          ) : orders.slice(0,3).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#484f58] text-sm mb-3">কোনো অর্ডার নেই</p>
              <Link href="/courses" className="btn-primary text-sm px-4 py-2">কোর্স দেখুন</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0,3).map((order: any) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#e6edf3] truncate">{order.contentItem?.titleBn}</p>
                    <p className="text-xs text-[#484f58] mt-0.5">৳{Number(order.pricePaid).toLocaleString('bn-BD')}</p>
                  </div>
                  <span className={`status-badge ${
                    order.status === 'VERIFIED' ? 'status-verified' :
                    order.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                  }`}>
                    {order.status === 'VERIFIED' ? 'যাচাইকৃত' : order.status === 'REJECTED' ? 'প্রত্যাখ্যাত' : 'অপেক্ষামান'}
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
