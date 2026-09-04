'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ContentCard, ContentCardSkeleton } from '@/components/content/ContentCard';
import { api } from '@/lib/api-client';
import { ContentCategory, ContentLevel, ContentType } from '@elearning/shared';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { value: '',                            label: 'সব বিভাগ' },
  { value: ContentCategory.ADMISSION,     label: 'ভর্তি পরীক্ষা' },
  { value: ContentCategory.JOB_PREPARATION, label: 'চাকরি প্রস্তুতি' },
  { value: ContentCategory.ACADEMIC,      label: 'একাডেমিক' },
  { value: ContentCategory.LANGUAGE,      label: 'ভাষা শিক্ষা' },
  { value: ContentCategory.SKILLS,        label: 'দক্ষতা উন্নয়ন' },
  { value: ContentCategory.RELIGION,      label: 'ধর্মীয়' },
];

const LEVELS = [
  { value: '',                       label: 'সব স্তর' },
  { value: ContentLevel.BEGINNER,    label: 'প্রাথমিক' },
  { value: ContentLevel.INTERMEDIATE,label: 'মধ্যবর্তী' },
  { value: ContentLevel.ADVANCED,    label: 'উন্নত' },
];

interface Props { type: ContentType; }

export function ContentCatalog({ type }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  const LIMIT = 12;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: any = { type, page, limit: LIMIT };
        if (search)   params.search   = search;
        if (category) params.category = category;
        if (level)    params.level    = level;
        const { data } = await api.getContent(params);
        setItems(data.items || []);
        setTotal(data.total || 0);
      } catch { setItems([]); }
      finally { setLoading(false); }
    };
    load();
  }, [type, page, search, category, level]);

  const clearFilters = () => { setSearch(''); setCategory(''); setLevel(''); setPage(1); };
  const hasFilters = search || category || level;

  return (
    <div>
      {/* Filter bar */}
      <div className="glass-card p-4 mb-8 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="কোর্স খুঁজুন..."
            className="form-input pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Category select */}
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="form-input py-2.5 text-sm w-full sm:w-48"
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* Level select — courses only */}
        {type === ContentType.COURSE && (
          <select
            value={level}
            onChange={(e) => { setLevel(e.target.value); setPage(1); }}
            className="form-input py-2.5 text-sm w-full sm:w-40"
          >
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        )}

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-[#8b949e] hover:text-white px-3 py-2.5 rounded-xl border border-[#30363d] hover:border-[#ff7a45] transition-all">
            <X className="w-3.5 h-3.5" /> ফিল্টার বাতিল
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-[#8b949e] mb-5">
          মোট <span className="text-white font-semibold">{total.toLocaleString('bn-BD')}</span> টি ফলাফল
          {search && <> "<span className="text-[#ff7a45]">{search}</span>" এর জন্য</>}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: LIMIT }).map((_, i) => <ContentCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-[#8b949e] text-lg">কোনো ফলাফল পাওয়া যায়নি</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-outline mt-4 text-sm">
              ফিল্টার বাতিল করুন
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-sm border border-[#30363d] text-[#8b949e] hover:border-[#ff7a45] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ← আগের পাতা
              </button>
              <span className="text-sm text-[#8b949e] px-3">
                পাতা {page} / {Math.ceil(total / LIMIT)}
              </span>
              <button
                disabled={page >= Math.ceil(total / LIMIT)}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-sm border border-[#30363d] text-[#8b949e] hover:border-[#ff7a45] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                পরের পাতা →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
