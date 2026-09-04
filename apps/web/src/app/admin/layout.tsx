'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Users, BookOpen,
  Link2, LogOut, Shield, ChevronRight, KeyRound, Settings,
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { href: '/admin/dashboard',        label: 'ড্যাশবোর্ড',        icon: LayoutDashboard },
  { href: '/admin/orders',           label: 'অর্ডার',             icon: ShoppingBag },
  { href: '/admin/access-requests',  label: 'অ্যাক্সেস অনুরোধ',  icon: KeyRound },
  { href: '/admin/users',            label: 'ব্যবহারকারী',        icon: Users },
  { href: '/admin/content',          label: 'কনটেন্ট',            icon: BookOpen },
  { href: '/admin/affiliate',        label: 'অ্যাফিলিয়েট',       icon: Link2 },
  { href: '/admin/settings',         label: 'সেটিংস',             icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { admin, adminLogout } = useAdminAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0d1117] border-r border-[#30363d] flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#30363d]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff7a45] to-[#e8612a] flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">শিক্ষা অ্যাডমিন</p>
          <p className="text-[10px] text-[#484f58]">Management Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + logout */}
      <div className="p-4 border-t border-[#30363d]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#ff7a45]/20 flex items-center justify-center text-[#ff7a45] font-bold text-sm">
            {admin?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{admin?.name || 'Admin'}</p>
            <p className="text-[10px] text-[#484f58] truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={adminLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          লগআউট
        </button>
      </div>
    </aside>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') return null;

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-[#090d13] text-[#e6edf3] flex">
        <AdminGuard>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminGuard>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontFamily: 'Hind Siliguri, Noto Sans Bengali, sans-serif',
            },
          }}
        />
      </div>
    </AdminAuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <div className="flex-1">{children}</div>;
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#0d1117] px-6 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="text-xs text-[#484f58]">
            {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </>
  );
}
