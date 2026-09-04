import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GraduationCap, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#30363d] mt-auto">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white font-bangla">শিক্ষা</p>
                <p className="text-xs text-[#8b949e] -mt-1">{t('tagline')}</p>
              </div>
            </Link>
            <p className="text-sm text-[#8b949e] leading-relaxed mb-5">
              বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম। বিশেষজ্ঞ শিক্ষকদের তত্ত্বাবধানে আপনার লক্ষ্য পূরণ করুন।
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#ff7a45] transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-[#30363d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#ff7a45] transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t('quick_links')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/',          label: nav('home') },
                { href: '/courses',   label: nav('courses') },
                { href: '/books',     label: nav('books') },
                { href: '/affiliate', label: nav('affiliate') },
                { href: '/about',     label: nav('about') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#8b949e] hover:text-[#ff7a45] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#ff7a45] opacity-50" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t('support')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/terms',           label: t('terms') },
                { href: '/privacy-policy',  label: t('privacy') },
                { href: '/refund-policy',   label: t('refund') },
                { href: '/contact',         label: t('contact') },
                { href: '/about',           label: 'আমাদের সম্পর্কে' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#8b949e] hover:text-[#ff7a45] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#ff7a45] opacity-50" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              {t('contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#ff7a45] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#8b949e]">০১XXXXXXXXX<br />(সকাল ৯টা — রাত ১০টা)</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#ff7a45] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#8b949e]">support@shikkha.com.bd</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#ff7a45] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#8b949e]">ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>

            {/* Payment badges */}
            <div className="mt-6">
              <p className="text-xs text-[#484f58] mb-3 uppercase tracking-wider">পেমেন্ট পদ্ধতি</p>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#d82b8c' }}>bKash</span>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#e2231a' }}>Nagad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#30363d] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#484f58]">
            © {year} শিক্ষা। {t('copyright')}।
          </p>
          <p className="text-xs text-[#484f58]">
            Made with ❤️ for Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
