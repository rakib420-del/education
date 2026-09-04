'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function LearnRedirectPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!contentId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/${contentId}`)
      .then((r) => r.json())
      .then((course) => {
        if (course?.lessons?.[0]?.id) {
          router.replace(`/learn/${contentId}/${course.lessons[0].id}`);
        } else {
          router.replace(`/courses`);
        }
      })
      .catch(() => router.replace(`/courses`));
  }, [contentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
