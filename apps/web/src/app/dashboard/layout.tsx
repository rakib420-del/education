'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, BookOpen, GraduationCap, ShoppingBag,
  User, Smartphone, LogOut,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/dashboard/my-courses', label: 'আমার কোর্স', icon: GraduationCap },
  { href: '/dashboard/my-books', label: 'আমার বই', icon: BookOpen },
  { href: '/dashboard/orders', label: 'অর্ডার ইতিহাস', icon: ShoppingBag },
  { href: '/dashboard/profile', label: 'প্রোফাইল', icon: User },
  { href: '/dashboard/device', label: 'ডিভাইস ও সেশন', icon: Smartphone },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#30363d] p-4 gap-1 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.[0] || 'ব'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-[#8b949e] font-mono truncate">{user?.mobileNumber || user?.phoneNumber || user?.email}</p>
          </div>
        </div>

        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-[#30363d]">
          <button onClick={logout} className="sidebar-link w-full text-[#f85149] hover:text-[#f85149] hover:bg-[#f85149]/5">
            <LogOut className="w-4 h-4" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#30363d] bg-[#0d1117]/95 backdrop-blur-xl">
        <div className="flex">
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? 'text-[#ff7a45]' : 'text-[#484f58]'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] leading-none">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
