import Image from 'next/image';
import Link from 'next/link';
import { Star, Users, BookOpen, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { ContentItemDto } from '@elearning/shared';
import { ContentType } from '@elearning/shared';

interface ContentCardProps {
  item: ContentItemDto;
}

export function ContentCard({ item }: ContentCardProps) {
  const isCourse = item.type === ContentType.COURSE;
  const href = isCourse ? `/courses/${item.slug}` : `/books/${item.slug}`;
  const effectivePrice = item.discountPrice ?? item.price;
  const hasDiscount = item.discountPrice != null && item.discountPrice < item.price;

  return (
    <Link href={href} className="card group block">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#21262d]">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.titleBn}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-hero-gradient flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {item.isFeatured && (
            <span className="badge badge-accent text-[10px]">⭐ ফিচার্ড</span>
          )}
          <span className={`badge text-[10px] ${
            isCourse ? 'badge-primary' : 'bg-purple-900/60 text-purple-300 border border-purple-700'
          }`}>
            {isCourse ? 'কোর্স' : item.type === 'BOOK' ? 'বই' : 'নোট'}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <div className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            {effectivePrice === 0 ? 'বিনামূল্যে' : formatPrice(effectivePrice)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[#e6edf3] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-white transition-colors">
          {item.titleBn}
        </h3>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-[#8b949e] mb-3">
          {isCourse ? (
            <>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {item.lessonCount} পাঠ
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {item.enrollmentCount?.toLocaleString('bn-BD')} জন
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {item.chapterCount} অধ্যায়
            </span>
          )}

          {item.averageRating != null && (
            <span className="flex items-center gap-1 ml-auto">
              <Star className="w-3 h-3 text-[#d29922] fill-[#d29922]" />
              <span className="text-[#d29922]">{item.averageRating}</span>
            </span>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#ff7a45]">
              {effectivePrice === 0 ? 'বিনামূল্যে' : formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#8b949e] line-through">{formatPrice(item.price)}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-[#ff7a45] group-hover:underline">
            {isCourse ? 'ভর্তি হোন →' : 'কিনুন →'}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* Skeleton loader */
export function ContentCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer rounded-md w-3/4" />
        <div className="h-4 shimmer rounded-md w-1/2" />
        <div className="h-3 shimmer rounded-md w-1/3" />
      </div>
    </div>
  );
}
