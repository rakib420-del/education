'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { ContentType } from '@elearning/shared';
import { GraduationCap, Play, Clock, ArrowRight } from 'lucide-react';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyContent()
      .then(({ data }) => {
        const items = (data || []).filter(
          (item: any) =>
            item.contentItem?.type === ContentType.COURSE ||
            item.contentItem?.type === 'COURSE'
        );
        setCourses(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">আমার কোর্সসমূহ</h1>
        <p className="text-[#8b949e] text-sm">আপনার সক্রিয় কোর্সগুলোর শিক্ষা চালিয়ে যান</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-44 shimmer" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <GraduationCap className="w-12 h-12 text-[#484f58] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">কোনো কোর্স নথিভুক্ত করা নেই</h3>
          <p className="text-[#8b949e] text-sm mb-6">আমাদের জনপ্রিয় কোর্সগুলোতে অংশ নিন</p>
          <Link href="/courses" className="btn-primary text-sm px-6 py-2.5 inline-flex items-center gap-2">
            কোর্স দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((item) => {
            const course = item.contentItem || {};
            const progress = item.progress || 0;
            const totalLessons = course._count?.lessons || 1;
            const pct = Math.min(Math.round((progress / totalLessons) * 100), 100);

            return (
              <div key={item.id} className="glass-card p-5 flex flex-col justify-between hover:border-[#ff7a45]/30 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="badge badge-accent text-xs">কোর্স</span>
                    <span className="text-xs text-[#8b949e] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {progress}/{totalLessons} পাঠ সম্পন্ন
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                    {course.titleBn}
                  </h3>
                </div>

                <div className="mt-4 pt-4 border-t border-[#30363d] space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-[#8b949e] mb-1">
                      <span>অগ্রগতি</span>
                      <span className="font-bold text-[#ff7a45]">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#30363d] overflow-hidden">
                      <div
                        className="h-full bg-accent-gradient rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/learn/${course.slug || course.id}`}
                    className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {progress > 0 ? 'পড়া চালিয়ে যান' : 'কোর্স শুরু করুন'}
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
