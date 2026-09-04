import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContentCatalog } from '@/components/content/ContentCatalog';
import { ContentType } from '@elearning/shared';

export const metadata: Metadata = {
  title: 'কোর্সসমূহ',
  description: 'ভর্তি পরীক্ষা, চাকরি প্রস্তুতি ও দক্ষতা উন্নয়নের কোর্স দেখুন।',
};

export default function CoursesPage() {
  return (
    <div className="section container-main">
      <div className="mb-10">
        <div className="divider" />
        <h1 className="section-title">সকল কোর্স</h1>
        <p className="section-subtitle !mb-0">বিশেষজ্ঞ শিক্ষকদের সাথে আপনার লক্ষ্য পূরণ করুন</p>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <ContentCatalog type={ContentType.COURSE} />
      </Suspense>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-video shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 shimmer rounded w-3/4" />
            <div className="h-3 shimmer rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
