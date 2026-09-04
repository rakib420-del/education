'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, GraduationCap, LayoutDashboard, LogOut,
  Menu, X, User, ChevronDown, Tag,
} from 'lucide-react';

export function Navbar() {
  const t = useTranslations('nav');
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/', label: t('home'), icon: null },
    { href: '/courses', label: t('courses'), icon: <GraduationCap className="w-4 h-4" /> },
    { href: '/books', label: t('books'), icon: <BookOpen className="w-4 h-4" /> },
    { href: '/affiliate', label: t('affiliate'), icon: <Tag className="w-4 h-4" /> },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d] shadow-xl'
            : 'bg-transparent'
          }`}
      >
        <div className="container-main">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-bangla">শিক্ষা</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                      ? 'text-white bg-white/10'
                      : 'text-[#8b949e] hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth area */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[#e6edf3] hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-gradient flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0] || 'ব'}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 glass-card z-20 py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#e6edf3] hover:bg-white/5 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#8b949e]" />
                          {t('dashboard')}
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#e6edf3] hover:bg-white/5 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-4 h-4 text-[#8b949e]" />
                          {t('profile') || 'প্রোফাইল'}
                        </Link>
                        <hr className="my-1 border-[#30363d]" />
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#f85149] hover:bg-white/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm px-4 py-2">
                    {t('login')}
                  </Link>
                  <Link href="/register" className="btn-primary text-sm px-4 py-2">
                    {t('register')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute left-0 top-0 bottom-0 w-72 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          style={{ background: '#0d1117', borderRight: '1px solid #30363d' }}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">শিক্ষা</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-1 text-[#8b949e]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.href)
                    ? 'text-white bg-white/10'
                    : 'text-[#8b949e] hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#30363d]">
            {isAuthenticated && user ? (
              <div className="space-y-1">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#e6edf3] hover:bg-white/5">
                  <LayoutDashboard className="w-4 h-4" /> {t('dashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#f85149] hover:bg-white/5"
                >
                  <LogOut className="w-4 h-4" /> {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" className="btn-secondary text-center text-sm">{t('login')}</Link>
                <Link href="/register" className="btn-primary text-center text-sm">{t('register')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
