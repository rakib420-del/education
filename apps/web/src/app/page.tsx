import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  GraduationCap, BookOpen, Users, Star, ArrowRight,
  TrendingUp, Shield, Clock, CheckCircle,
} from 'lucide-react';
import { ContentCard, ContentCardSkeleton } from '@/components/content/ContentCard';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'শিক্ষা — বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম',
  description: 'ভর্তি পরীক্ষা, চাকরি প্রস্তুতি ও দক্ষতা উন্নয়নে বিশেষজ্ঞদের সাথে অনলাইনে পড়ুন।',
};

async function getFeaturedContent() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content?isFeatured=true&limit=6`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return { items: [] };
    return res.json();
  } catch {
    return { items: [] };
  }
}

async function getAffiliateOffers() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/affiliate`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const testimonials = [
  { name: 'মো. রাকিবুল ইসলাম', role: 'HSC পরীক্ষার্থী', rating: 5, comment: 'শিক্ষা প্ল্যাটফর্মের কোর্সগুলো আমার ভর্তি পরীক্ষার প্রস্তুতিতে অনেক সাহায্য করেছে। শিক্ষকরা অনেক স্পষ্ট করে বোঝান।' },
  { name: 'নাফিসা আক্তার', role: 'BCS প্রার্থী', rating: 5, comment: 'নগদে পেমেন্ট করা খুব সহজ ছিল। ২৪ ঘণ্টার মধ্যে এক্সেস পেয়েছি। কোর্সের মানও চমৎকার!' },
  { name: 'সাদমান সাকিব', role: 'বিশ্ববিদ্যালয় শিক্ষার্থী', rating: 5, comment: 'ভিডিও কোয়ালিটি এবং শিক্ষকদের পড়ানোর ধরন সত্যিই অসাধারণ। মোবাইলে দেখতেও সুবিধা।' },
];


const features = [
  { icon: Shield,       title: 'নিরাপদ পেমেন্ট',      desc: 'bKash, Nagad, Rocket-এ পেমেন্ট করুন। আমাদের টিম ম্যানুয়ালি যাচাই করে।' },
  { icon: Clock,        title: '২৪ ঘণ্টা অ্যাক্সেস',  desc: 'যেকোনো সময়, যেকোনো ডিভাইসে আপনার কোর্স দেখুন।' },
  { icon: CheckCircle,  title: 'বিশেষজ্ঞ শিক্ষক',     desc: 'অভিজ্ঞ ও পরীক্ষিত শিক্ষকদের কাছ থেকে শিখুন।' },
  { icon: Star,         title: 'মানসম্পন্ন কনটেন্ট',  desc: 'HD ভিডিও, নোটস এবং প্র্যাকটিস ম্যাটেরিয়াল।' },
];

export default async function HomePage() {
  const t = await getTranslations('home');
  const [featured, affiliateOffers] = await Promise.all([getFeaturedContent(), getAffiliateOffers()]);

  const courses = featured.items?.filter((i: any) => i.type === 'COURSE') || [];
  const books   = featured.items?.filter((i: any) => i.type !== 'COURSE') || [];

  return (
    <>
      {/* ── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-32">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#ff7a45]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#1c5a9e]/30 rounded-full blur-3xl" />
        </div>
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="container-main relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ff7a45]/30 bg-[#ff7a45]/10 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#ff7a45] animate-pulse" />
              <span className="text-sm text-[#ff7a45] font-medium">{t('hero.badge')}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight animate-fade-up">
              {t('hero.title').split(' ').slice(0, 3).join(' ')}{' '}
              <span className="gradient-text">{t('hero.title').split(' ').slice(3).join(' ')}</span>
            </h1>

            <p className="text-lg md:text-xl text-[#c8d1da] mb-10 leading-relaxed animate-fade-up animate-delay-100">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animate-delay-200">
              <Link href="/courses" className="btn-primary text-base px-8 py-4">
                <GraduationCap className="w-5 h-5" />
                {t('hero.cta_courses')}
              </Link>
              <Link href="/books" className="btn-secondary text-base px-8 py-4">
                <BookOpen className="w-5 h-5" />
                {t('hero.cta_books')}
              </Link>
            </div>
          </div>


        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="section bg-[#0d1117]">
        <div className="container-main">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card p-6 hover:border-[#ff7a45]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#ff7a45]/10 border border-[#ff7a45]/20 flex items-center justify-center mb-4 group-hover:bg-[#ff7a45]/20 transition-all">
                  <f.icon className="w-6 h-6 text-[#ff7a45]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#8b949e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ─────────────────── */}
      {courses.length > 0 && (
        <section className="section">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="divider" />
                <h2 className="section-title">{t('featured_courses')}</h2>
                <p className="section-subtitle !mb-0">বিশেষজ্ঞ শিক্ষকদের সেরা কোর্সসমূহ</p>
              </div>
              <Link href="/courses" className="hidden md:flex items-center gap-1.5 text-sm text-[#ff7a45] hover:underline">
                {t('view_all')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 6).map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            <div className="text-center mt-8 md:hidden">
              <Link href="/courses" className="btn-outline">{t('view_all')}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED BOOKS ───────────────────── */}
      {books.length > 0 && (
        <section className="section" style={{ background: '#0d1117' }}>
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="divider" />
                <h2 className="section-title">{t('featured_books')}</h2>
                <p className="section-subtitle !mb-0">প্রয়োজনীয় বই ও নোটস</p>
              </div>
              <Link href="/books" className="hidden md:flex items-center gap-1.5 text-sm text-[#ff7a45] hover:underline">
                {t('view_all')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.slice(0, 3).map((item: any) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AFFILIATE OFFERS ─────────────────── */}
      {affiliateOffers.length > 0 && (
        <section className="section">
          <div className="container-main">
            <div className="mb-8">
              <div className="divider" />
              <h2 className="section-title">{t('affiliate_offers')}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliateOffers.map((offer: any) => (
                <a
                  key={offer.id}
                  href={offer.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group p-5 flex items-start gap-4 hover:border-[#ff7a45]/30"
                  onClick={async () => {
                    await fetch(`/api/content/affiliate/${offer.id}/click`, { method: 'POST' });
                  }}
                >
                  {offer.thumbnailUrl && (
                    <img src={offer.thumbnailUrl} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#e6edf3] group-hover:text-white transition-colors line-clamp-1 mb-1">
                      {offer.titleBn}
                    </h3>
                    {offer.descriptionBn && (
                      <p className="text-xs text-[#8b949e] line-clamp-2">{offer.descriptionBn}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-[#ff7a45] mt-2 font-medium">
                      দেখুন <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────── */}
      <section className="section" style={{ background: '#0d1117' }}>
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="divider mx-auto" />
            <h2 className="section-title">{t('testimonials')}</h2>
            <p className="section-subtitle">আমাদের শিক্ষার্থীরা কী বলছেন</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card p-6 hover:border-[#ff7a45]/20 transition-all">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-[#d29922] fill-[#d29922]" />
                  ))}
                </div>
                <p className="text-sm text-[#c8d1da] leading-relaxed mb-5 italic">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[#8b949e]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────── */}
      <section className="section">
        <div className="container-main">
          <div
            className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f3d5c 0%, #1c5a9e 60%, #0f3d5c 100%)' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff7a45]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff7a45]/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                আজই আপনার যাত্রা শুরু করুন
              </h2>
              <p className="text-[#c8d1da] mb-8 max-w-xl mx-auto">
                হাজারো শিক্ষার্থীর সাথে যোগ দিন এবং আপনার স্বপ্নের লক্ষ্য পূরণ করুন।
              </p>
              <Link href="/register" className="btn-primary text-base px-10 py-4">
                <GraduationCap className="w-5 h-5" />
                বিনামূল্যে নিবন্ধন করুন
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
