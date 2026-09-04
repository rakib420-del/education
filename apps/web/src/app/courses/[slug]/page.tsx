import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen, Users, Star, Clock, CheckCircle,
  Lock, Play, ChevronRight, ShoppingCart, ChevronDown, ChevronUp,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ContentType } from '@elearning/shared';
import { CourseEnrollButton } from '@/components/content/CourseEnrollButton';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getCourse(slug: string) {
  try {
    const res = await fetch(`${API}/content/${slug}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: 'কোর্স পাওয়া যায়নি' };
  return {
    title: course.titleBn,
    description: course.descriptionBn?.slice(0, 155),
    openGraph: {
      title: course.titleBn,
      description: course.descriptionBn?.slice(0, 155),
      images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourse(params.slug);
  if (!course) notFound();

  const isCourse = course.type === ContentType.COURSE;
  const effectivePrice = course.discountPrice ?? course.price;
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-hero-gradient">
        <div className="absolute inset-0 opacity-20">
          {course.thumbnailUrl && (
            <Image src={course.thumbnailUrl} alt="" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>
        <div className="container-main relative z-10 py-12 md:py-20">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[#8b949e] mb-4">
              <Link href="/" className="hover:text-white">হোম</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={isCourse ? '/courses' : '/books'} className="hover:text-white">
                {isCourse ? 'কোর্স' : 'বই'}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white line-clamp-1">{course.titleBn}</span>
            </nav>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {course.titleBn}
            </h1>



            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#c8d1da]">
              {course.averageRating && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#d29922] fill-[#d29922]" />
                  <strong className="text-[#d29922]">{course.averageRating}</strong>
                  ({course.reviewCount} রিভিউ)
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {course.enrollmentCount?.toLocaleString('bn-BD')} শিক্ষার্থী
              </span>
              {isCourse ? (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.lessonCount} টি পাঠ
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.chapterCount} টি অধ্যায়
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container-main py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Full Course Description */}
            {course.descriptionBn && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-bangla">
                  <CheckCircle className="w-5 h-5 text-[#ff7a45]" />
                  কোর্সের বিস্তারিত বিবরণ
                </h2>
                <div className="text-sm md:text-base text-[#c8d1da] font-bangla leading-relaxed space-y-3">
                  {course.descriptionBn.split('\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                    <p key={idx} className="text-[#c8d1da] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Lessons / chapters list */}
            {isCourse && course.lessons?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#ff7a45]" />
                  কোর্সের বিষয়বস্তু
                </h2>
                <div className="space-y-2">
                  {course.lessons.map((lesson: any, i: number) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        lesson.isPreview
                          ? 'hover:bg-white/5 cursor-pointer'
                          : 'opacity-70'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: lesson.isPreview ? 'rgba(255,122,69,0.15)' : 'rgba(255,255,255,0.05)' }}>
                        {lesson.isPreview
                          ? <Play className="w-3.5 h-3.5 text-[#ff7a45]" />
                          : <Lock className="w-3.5 h-3.5 text-[#8b949e]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#e6edf3] truncate">
                          <span className="text-[#484f58] mr-2">{i + 1}.</span>
                          {lesson.titleBn}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lesson.durationSeconds && (
                          <span className="text-xs text-[#8b949e] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(lesson.durationSeconds / 60)} মিনিট
                          </span>
                        )}
                        {lesson.isPreview && (
                          <span className="badge badge-accent text-[10px]">বিনামূল্যে</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book chapters */}
            {!isCourse && course.chapters?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#ff7a45]" />
                  সূচিপত্র
                </h2>
                <div className="space-y-2">
                  {course.chapters.map((ch: any, i: number) => (
                    <div key={ch.id} className="flex items-center gap-3 p-3 rounded-xl">
                      <span className="w-7 h-7 rounded-full bg-[#ff7a45]/10 text-[#ff7a45] text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[#e6edf3] flex-1">{ch.titleBn}</p>
                      {ch.pageCount && (
                        <span className="text-xs text-[#8b949e]">{ch.pageCount} পৃষ্ঠা</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What you'll get */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-5">এই {isCourse ? 'কোর্সে' : 'বইয়ে'} যা পাবেন</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  isCourse ? 'HD মানের ভিডিও লেকচার' : 'সহজবোধ্য পিডিএফ',
                  'বিশেষজ্ঞ শিক্ষকের গাইডেন্স',
                  'যেকোনো ডিভাইসে অ্যাক্সেস',
                  'আজীবন অ্যাক্সেস',
                  'প্র্যাকটিস প্রশ্ন',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-[#c8d1da]">
                    <CheckCircle className="w-4 h-4 text-[#3fb950] flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: price card (sticky) */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              {/* Thumbnail */}
              {course.thumbnailUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-5">
                  <Image src={course.thumbnailUrl} alt={course.titleBn} fill className="object-cover" />
                </div>
              )}

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-extrabold text-white">
                    {effectivePrice === 0 ? 'বিনামূল্যে' : formatPrice(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-[#8b949e] line-through mb-1">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="badge badge-accent text-xs mt-1">
                    {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% ছাড়
                  </span>
                )}
              </div>

              {/* CTA */}
              <CourseEnrollButton
                courseId={course.id}
                slug={course.slug}
                price={effectivePrice}
                firstLessonId={course.lessons?.[0]?.id}
                firstChapterId={course.chapters?.[0]?.id}
                isCourse={isCourse}
                initialHasAccess={course.hasAccess}
                initialHasPendingOrder={course.hasPendingOrder}
              />

              <p className="text-xs text-[#8b949e] text-center mt-3">
                ৩০ দিনের মানি-ব্যাক গ্যারান্টি
              </p>

              {/* Payment methods */}
              <div className="mt-4 pt-4 border-t border-[#30363d]">
                <p className="text-xs text-[#484f58] text-center mb-3">পেমেন্ট গ্রহণযোগ্য</p>
                <div className="flex justify-center gap-2">
                  {['bKash', 'Nagad'].map((m) => (
                    <span key={m} className="text-xs font-bold px-2 py-1 rounded text-white"
                      style={{ background: m === 'bKash' ? '#d82b8c' : '#e2231a' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
