import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContentCatalog } from '@/components/content/ContentCatalog';
import { ContentType } from '@elearning/shared';

export const metadata: Metadata = {
  title: 'বই ও নোটস',
  description: 'ভর্তি পরীক্ষা ও চাকরি প্রস্তুতির জন্য সেরা বই ও নোটস।',
};

export default function BooksPage() {
  return (
    <div className="section container-main">
      <div className="mb-10">
        <div className="divider" />
        <h1 className="section-title">বই ও নোটস</h1>
        <p className="section-subtitle !mb-0">প্রয়োজনীয় পড়াশোনার সামগ্রী এক জায়গায়</p>
      </div>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length:6}).map((_,i)=><div key={i} className="card"><div className="aspect-video shimmer"/><div className="p-4 space-y-3"><div className="h-4 shimmer rounded w-3/4"/></div></div>)}</div>}>
        <ContentCatalog type={ContentType.BOOK} />
      </Suspense>
    </div>
  );
}
