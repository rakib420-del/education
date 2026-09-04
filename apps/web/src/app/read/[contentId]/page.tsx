'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReadRedirectPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!contentId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/${contentId}`)
      .then((r) => r.json())
      .then((book) => {
        if (book?.chapters?.[0]?.id) {
          router.replace(`/read/${contentId}/${book.chapters[0].id}`);
        } else {
          router.replace(`/books`);
        }
      })
      .catch(() => router.replace(`/books`));
  }, [contentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
