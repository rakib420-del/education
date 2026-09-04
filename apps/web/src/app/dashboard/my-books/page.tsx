'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { ContentType } from '@elearning/shared';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function MyBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyContent()
      .then(({ data }) => {
        const items = (data || []).filter(
          (item: any) =>
            item.contentItem?.type === ContentType.BOOK ||
            item.contentItem?.type === 'BOOK' ||
            item.contentItem?.type === 'NOTE'
        );
        setBooks(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">আমার বই ও নোটস</h1>
        <p className="text-[#8b949e] text-sm">ক্রয়কৃত ই-বুক ও নোটসগুলো পড়ুন</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-40 shimmer" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#484f58] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">কোনো ই-বুক ক্রয় করা নেই</h3>
          <p className="text-[#8b949e] text-sm mb-6">পরীক্ষা প্রস্তুতির জন্য দরকারী বই সংগ্রহ করুন</p>
          <Link href="/books" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
            বইসমূহ দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {books.map((item) => {
            const book = item.contentItem;
            return (
              <div key={item.id} className="glass-card p-5 flex flex-col justify-between hover:border-[#ff7a45]/30 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="badge badge-accent text-xs">ই-বুক</span>
                    <span className="text-xs text-[#8b949e]">
                      {book._count?.chapters || 0} টি অধ্যায়
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                    {book.titleBn}
                  </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-[#30363d]">
                  <Link
                    href={`/books/${book.slug || book.id}`}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    পড়া শুরু করুন
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
