'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, Plus, Pencil, Trash2, Eye, EyeOff,
  ChevronDown, ChevronUp, Video, X, Check, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';
import {
  ContentType, ContentCategory, ContentLevel,
  ContentCategoryLabelBn, ContentLevelLabelBn,
} from '@elearning/shared';

// ── helpers ────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = { COURSE: 'কোর্স', BOOK: 'বই', NOTE: 'নোট' };
const TYPE_COLOR: Record<string, string> = {
  COURSE: '#ff7a45', BOOK: '#58a6ff', NOTE: '#bc8cff',
};

// ── Content form modal ──────────────────────────────────
function ContentFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: any;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    type:         initial?.type         || ContentType.COURSE,
    titleBn:      initial?.titleBn      || '',
    titleEn:      initial?.titleEn      || '',
    descriptionBn:initial?.descriptionBn|| '',
    slug:         initial?.slug         || '',
    category:     initial?.category     || ContentCategory.ACADEMIC,
    level:        initial?.level        || ContentLevel.BEGINNER,
    price:        initial?.price        || 0,
    discountPrice:initial?.discountPrice|| '',
    thumbnailUrl: initial?.thumbnailUrl || '',
    isFeatured:   initial?.isFeatured   ?? false,
    isPublished:  initial?.isPublished  ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').slice(0, 80);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice !== '' && form.discountPrice !== undefined && form.discountPrice !== null ? Number(form.discountPrice) : undefined,
        titleEn: form.titleEn?.trim() || undefined,
        descriptionBn: form.descriptionBn?.trim() || undefined,
        thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-card w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-white">
            {initial ? 'কনটেন্ট সম্পাদনা' : 'নতুন কনটেন্ট'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#484f58] hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">ধরন</label>
              <select className="form-input text-sm" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {Object.entries(TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">বিভাগ</label>
              <select className="form-input text-sm" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {Object.entries(ContentCategoryLabelBn).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">শিরোনাম (বাংলা) *</label>
            <input
              className="form-input text-sm"
              placeholder="কোর্স/বইয়ের নাম"
              value={form.titleBn}
              onChange={(e) => {
                set('titleBn', e.target.value);
                if (!initial) set('slug', autoSlug(e.target.value));
              }}
              required
            />
          </div>

          <div>
            <label className="form-label">শিরোনাম (ইংরেজি)</label>
            <input className="form-input text-sm" placeholder="English title (optional)" value={form.titleEn}
              onChange={(e) => set('titleEn', e.target.value)} />
          </div>

          <div>
            <label className="form-label">স্লাগ (URL) *</label>
            <input className="form-input text-sm font-mono" placeholder="course-url-slug"
              value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
          </div>

          <div>
            <label className="form-label">বিবরণ (বাংলা)</label>
            <textarea className="form-input text-sm resize-none h-20"
              placeholder="কোর্স/বইয়ের বিস্তারিত বিবরণ..."
              value={form.descriptionBn} onChange={(e) => set('descriptionBn', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">স্তর</label>
              <select className="form-input text-sm" value={form.level} onChange={(e) => set('level', e.target.value)}>
                {Object.entries(ContentLevelLabelBn).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">মূল্য (৳) *</label>
              <input type="number" min="0" className="form-input text-sm" value={form.price}
                onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">ছাড়ের মূল্য (৳)</label>
              <input type="number" min="0" className="form-input text-sm" placeholder="ঐচ্ছিক"
                value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">থাম্বনেইল URL</label>
            <input className="form-input text-sm" placeholder="https://..." value={form.thumbnailUrl}
              onChange={(e) => set('thumbnailUrl', e.target.value)} />
          </div>

          <div className="flex gap-6">
            {[
              { key: 'isFeatured',  label: 'বৈশিষ্ট্যযুক্ত' },
              { key: 'isPublished', label: 'প্রকাশিত'       },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => set(key, !(form as any)[key])}
                  className={`w-10 h-5 rounded-full transition-colors relative ${(form as any)[key] ? 'bg-[#ff7a45]' : 'bg-[#30363d]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-[#8b949e]">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {saving ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> সংরক্ষণ...</span> : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add/Edit Lesson Modal ────────────────────────────────────
function LessonFormModal({
  contentId,
  initial,
  onClose,
  onSuccess,
}: {
  contentId: string;
  initial?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    titleBn: initial?.titleBn || '',
    orderIndex: initial?.orderIndex ?? 0,
    videoAssetId: initial?.videoAssetId || '',
    videoUrl: initial?.videoUrl || '',
    durationSeconds: initial?.durationSeconds !== undefined && initial?.durationSeconds !== null ? String(initial.durationSeconds) : '',
    isPreview: initial?.isPreview ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titleBn: form.titleBn,
        orderIndex: Number(form.orderIndex),
        durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : undefined,
        videoAssetId: form.videoAssetId || undefined,
        videoUrl: form.videoUrl || undefined,
        isPreview: form.isPreview,
      };

      if (initial?.id) {
        await api.updateLesson(initial.id, payload);
        toast.success('লেকচার সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await api.addLesson(contentId, payload);
        toast.success('ভিডিও লেকচার সফলভাবে যোগ করা হয়েছে!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-[#ff7a45]" />
            {initial ? 'ভিডিও লেকচার সম্পাদনা করুন' : 'নতুন ভিডিও লেকচার / পাঠ যোগ করুন'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#484f58] hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">লেকচারের শিরোনাম (বাংলা) *</label>
            <input className="form-input text-sm" placeholder="উদা: লেকচার ১ - প্রাথমিক আলোচনা" value={form.titleBn}
              onChange={(e) => set('titleBn', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">ক্রম নম্বর (Order Index)</label>
              <input type="number" min="0" className="form-input text-sm" value={form.orderIndex}
                onChange={(e) => set('orderIndex', e.target.value)} />
            </div>
            <div>
              <label className="form-label">সময়কাল (সেকেন্ডে)</label>
              <input type="number" min="0" className="form-input text-sm" placeholder="উদা: ১৮০০ (৩০ মিনিট)"
                value={form.durationSeconds} onChange={(e) => set('durationSeconds', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Bunny.net Video GUID (যদি থাকে)</label>
            <input className="form-input text-sm font-mono" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={form.videoAssetId} onChange={(e) => set('videoAssetId', e.target.value)} />
          </div>

          <div>
            <label className="form-label">সরাসরি ভিডিও/স্ট্রিম URL (ঐচ্ছিক)</label>
            <input className="form-input text-sm font-mono" placeholder="https://..."
              value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
            <p className="text-[11px] text-[#8b949e] mt-1">
              Bunny Stream ভিডিও আইডি অথবা সরাসরি ভিডিও লিঙ্ক (MP4/HLS) ব্যবহার করতে পারেন।
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" className="w-4 h-4 accent-[#ff7a45]" checked={form.isPreview}
              onChange={(e) => set('isPreview', e.target.checked)} />
            <span className="text-sm text-white">প্রিভিউ লেকচার (এনরোল না করে ফ্রিতে দেখা যাবে)</span>
          </label>

          <div className="flex gap-3 pt-3 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {saving ? 'সংরক্ষণ করা হচ্ছে...' : initial ? 'লেকচার আপডেট করুন' : 'লেকচার যুক্ত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add/Edit Chapter / PDF Modal ─────────────────────────────
function ChapterFormModal({
  contentId,
  initial,
  onClose,
  onSuccess,
}: {
  contentId: string;
  initial?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    titleBn: initial?.titleBn || '',
    orderIndex: initial?.orderIndex ?? 0,
    pdfAssetKey: initial?.pdfAssetKey || '',
    pageCount: initial?.pageCount !== undefined && initial?.pageCount !== null ? String(initial.pageCount) : '',
    isPreview: initial?.isPreview ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titleBn: form.titleBn,
        orderIndex: Number(form.orderIndex),
        pdfAssetKey: form.pdfAssetKey || undefined,
        pageCount: form.pageCount ? Number(form.pageCount) : undefined,
        isPreview: form.isPreview,
      };

      if (initial?.id) {
        await api.updateChapter(initial.id, payload);
        toast.success('অধ্যায় সফলভাবে আপডেট করা হয়েছে!');
      } else {
        await api.addChapter(contentId, payload);
        toast.success('পিডিএফ অধ্যায় সফলভাবে যোগ করা হয়েছে!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#58a6ff]" />
            {initial ? 'অধ্যায় / পিডিএফ সম্পাদনা করুন' : 'নতুন অধ্যায় / পিডিএফ যোগ করুন'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#484f58] hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="form-label">অধ্যায়ের শিরোনাম (বাংলা) *</label>
            <input className="form-input text-sm" placeholder="উদা: অধ্যায় ১ - মৌলিক ধারণা" value={form.titleBn}
              onChange={(e) => set('titleBn', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">ক্রম নম্বর (Order Index)</label>
              <input type="number" min="0" className="form-input text-sm" value={form.orderIndex}
                onChange={(e) => set('orderIndex', e.target.value)} />
            </div>
            <div>
              <label className="form-label">মোট পৃষ্ঠা সংখ্যা</label>
              <input type="number" min="1" className="form-input text-sm" placeholder="উদা: ৫০"
                value={form.pageCount} onChange={(e) => set('pageCount', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">পিডিএফ URL / স্টোরেজ লিঙ্ক *</label>
            <input className="form-input text-sm font-mono" placeholder="https://domain.com/book.pdf"
              value={form.pdfAssetKey} onChange={(e) => set('pdfAssetKey', e.target.value)} required />
            <p className="text-[11px] text-[#8b949e] mt-1">
              পিডিএফ ফাইলটি Google Drive, Cloudinary বা সরাসরি যেকোনো পাবলিক PDF URL লিঙ্ক দিতে পারেন।
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" className="w-4 h-4 accent-[#58a6ff]" checked={form.isPreview}
              onChange={(e) => set('isPreview', e.target.checked)} />
            <span className="text-sm text-white">প্রিভিউ অধ্যায় (ফ্রিতে পড়া যাবে)</span>
          </label>

          <div className="flex gap-3 pt-3 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50" style={{ background: '#58a6ff' }}>
              {saving ? 'সংরক্ষণ করা হচ্ছে...' : initial ? 'অধ্যায় আপডেট করুন' : 'অধ্যায় যুক্ত করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────
export default function AdminContentPage() {
  const [items, setItems]         = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [formModal, setFormModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [lessonModal, setLessonModal] = useState<{ open: boolean; contentId: string; lesson?: any }>({ open: false, contentId: '' });
  const [chapterModal, setChapterModal] = useState<{ open: boolean; contentId: string; chapter?: any }>({ open: false, contentId: '' });
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchContent = useCallback(() => {
    setLoading(true);
    api.adminContent({ page, limit: 12, search: search || undefined, includeUnpublished: true })
      .then(({ data }) => {
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error('কনটেন্ট লোড ব্যর্থ'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleCreate = async (data: any) => {
    await api.createContent(data);
    toast.success('কনটেন্ট তৈরি হয়েছে');
    fetchContent();
  };

  const handleUpdate = async (id: string, data: any) => {
    await api.updateContent(id, data);
    toast.success('কনটেন্ট আপডেট হয়েছে');
    fetchContent();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই কনটেন্টটি মুছে ফেলবেন?')) return;
    try {
      await api.deleteContent(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchContent();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'মুছে ফেলা ব্যর্থ');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('এই লেকচারটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteLesson(lessonId);
      toast.success('লেকচার মুছে ফেলা হয়েছে');
      fetchContent();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'মুছে ফেলা ব্যর্থ');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('এই অধ্যায়টি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteChapter(chapterId);
      toast.success('অধ্যায় মুছে ফেলা হয়েছে');
      fetchContent();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'মুছে ফেলা ব্যর্থ');
    }
  };

  const togglePublish = async (item: any) => {
    try {
      await api.updateContent(item.id, { isPublished: !item.isPublished });
      toast.success(item.isPublished ? 'অপ্রকাশিত করা হয়েছে' : 'প্রকাশিত হয়েছে');
      fetchContent();
    } catch {
      toast.error('আপডেট ব্যর্থ');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">কনটেন্ট ব্যবস্থাপনা</h1>
          <p className="text-sm text-[#8b949e]">মোট {total} টি কনটেন্ট</p>
        </div>
        <div className="flex gap-2">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
            <input
              className="form-input py-2 text-sm w-48"
              placeholder="খুঁজুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary py-2 px-3 text-sm">খুঁজুন</button>
          </form>
          <button
            onClick={() => setFormModal({ open: true })}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4" /> নতুন
          </button>
        </div>
      </div>

      {/* Content grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="h-5 shimmer rounded w-3/4" />
              <div className="h-3 shimmer rounded w-1/2" />
              <div className="h-3 shimmer rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-[#484f58]">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          কোনো কনটেন্ট পাওয়া যায়নি
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="glass-card overflow-hidden">
              {/* Row */}
              <div className="flex items-center gap-4 p-4 flex-wrap sm:flex-nowrap">
                {/* Thumbnail / type badge */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-[#21262d] flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-[#484f58]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: TYPE_COLOR[item.type] + '20', color: TYPE_COLOR[item.type] }}>
                      {TYPE_LABEL[item.type]}
                    </span>
                    {item.isFeatured && <span className="badge badge-accent text-[10px] py-0">বৈশিষ্ট্যযুক্ত</span>}
                    <span className={`text-[10px] font-semibold ${item.isPublished ? 'text-[#3fb950]' : 'text-[#484f58]'}`}>
                      {item.isPublished ? '● প্রকাশিত' : '○ খসড়া'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#e6edf3] truncate">{item.titleBn}</p>
                  <p className="text-xs text-[#484f58] font-mono">{item.slug}</p>
                </div>

                <div className="text-right flex-shrink-0 mr-2">
                  {item.discountPrice ? (
                    <>
                      <p className="text-base font-bold text-[#3fb950]">৳{item.discountPrice}</p>
                      <p className="text-xs text-[#484f58] line-through">৳{item.price}</p>
                    </>
                  ) : (
                    <p className="text-base font-bold text-[#e6edf3]">৳{item.price}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.type === ContentType.COURSE ? (
                    <button
                      onClick={() => setLessonModal({ open: true, contentId: item.id })}
                      className="px-3 py-1.5 rounded-xl bg-[#ff7a45]/15 border border-[#ff7a45]/30 text-[#ff7a45] hover:bg-[#ff7a45] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-glow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ভিডিও যোগ করুন
                    </button>
                  ) : (
                    <button
                      onClick={() => setChapterModal({ open: true, contentId: item.id })}
                      className="px-3 py-1.5 rounded-xl bg-[#58a6ff]/15 border border-[#58a6ff]/30 text-[#58a6ff] hover:bg-[#58a6ff] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-glow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      পিডিএফ যোগ করুন
                    </button>
                  )}

                  <button
                    onClick={() => togglePublish(item)}
                    className={`p-1.5 rounded-lg transition-all ${item.isPublished ? 'text-[#3fb950] hover:bg-[#3fb950]/15' : 'text-[#484f58] hover:bg-white/10 hover:text-white'}`}
                    title={item.isPublished ? 'অপ্রকাশিত করুন' : 'প্রকাশ করুন'}
                  >
                    {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setFormModal({ open: true, item })}
                    className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
                    title="সম্পাদনা"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-[#484f58] hover:text-[#f85149] hover:bg-[#f85149]/15 transition-all"
                    title="মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs"
                    title="বিস্তারিত ও সূচিপত্র দেখুন"
                  >
                    {expanded === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details & lessons/chapters */}
              {expanded === item.id && (
                <div className="border-t border-[#30363d] px-5 py-4 bg-[#0d1117]/60 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center p-3 rounded-xl bg-white/3 border border-[#30363d]">
                    {[
                      { label: 'এনরোলকৃত শিক্ষার্থী/ক্রেতা', value: item.enrollmentCount ?? 0 },
                      { label: 'মোট ভিডিও লেকচার',          value: item.lessonCount ?? 0     },
                      { label: 'মোট পিডিএফ অধ্যায়',         value: item.chapterCount ?? 0   },
                      { label: 'রিভিউ',                    value: item.reviewCount ?? 0     },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-base font-bold text-white">{value}</p>
                        <p className="text-xs text-[#8b949e]">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Lessons List if COURSE */}
                  {item.type === ContentType.COURSE && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-[#ff7a45]" />
                          যুক্ত করা ভিডিও লেকচারসমূহ ({item.lessons?.length || 0})
                        </h4>
                        <button
                          onClick={() => setLessonModal({ open: true, contentId: item.id })}
                          className="text-xs text-[#ff7a45] hover:underline font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> নতুন লেকচার যোগ করুন
                        </button>
                      </div>

                      {(!item.lessons || item.lessons.length === 0) ? (
                        <div className="p-4 rounded-xl bg-white/2 border border-[#30363d] text-center text-xs text-[#8b949e]">
                          এখনও কোনো ভিডিও লেকচার যোগ করা হয়নি। উপরের <strong>"ভিডিও যোগ করুন"</strong> বাটনে ক্লিক করে প্রথম লেকচার যোগ করুন।
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.lessons.map((lesson: any, idx: number) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-[#30363d] text-xs">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="w-6 h-6 rounded-full bg-[#ff7a45]/20 text-[#ff7a45] font-bold flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{lesson.titleBn}</p>
                                  <p className="text-[11px] text-[#8b949e] font-mono truncate">
                                    {lesson.videoAssetId ? `Video ID: ${lesson.videoAssetId}` : lesson.videoUrl ? `Video URL: ${lesson.videoUrl}` : 'ভিডিও লিঙ্ক যুক্ত নেই'}
                                    {lesson.durationSeconds ? ` • ${Math.floor(lesson.durationSeconds / 60)} মিনিট` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {lesson.isPreview && (
                                  <span className="badge badge-accent text-[10px]">ফ্রি প্রিভিউ</span>
                                )}
                                <button
                                  onClick={() => setLessonModal({ open: true, contentId: item.id, lesson })}
                                  className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
                                  title="লেকচার সম্পাদনা করুন"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  className="p-1.5 rounded text-[#484f58] hover:text-[#f85149] hover:bg-[#f85149]/15 transition-colors"
                                  title="লেকচার মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chapters List if BOOK / NOTE */}
                  {(item.type === ContentType.BOOK || item.type === ContentType.NOTE) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#58a6ff]" />
                          যুক্ত করা অধ্যায় / পিডিএফসমূহ ({item.chapters?.length || 0})
                        </h4>
                        <button
                          onClick={() => setChapterModal({ open: true, contentId: item.id })}
                          className="text-xs text-[#58a6ff] hover:underline font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> নতুন পিডিএফ অধ্যায় যোগ করুন
                        </button>
                      </div>

                      {(!item.chapters || item.chapters.length === 0) ? (
                        <div className="p-4 rounded-xl bg-white/2 border border-[#30363d] text-center text-xs text-[#8b949e]">
                          এখনও কোনো পিডিএফ অধ্যায় যোগ করা হয়নি। উপরের <strong>"পিডিএফ যোগ করুন"</strong> বাটনে ক্লিক করে প্রথম অধ্যায় যুক্ত করুন।
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {item.chapters.map((chapter: any, idx: number) => (
                            <div key={chapter.id} className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-[#30363d] text-xs">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span className="w-6 h-6 rounded-full bg-[#58a6ff]/20 text-[#58a6ff] font-bold flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{chapter.titleBn}</p>
                                  <p className="text-[11px] text-[#8b949e] font-mono truncate">
                                    {chapter.pdfAssetKey ? `PDF URL: ${chapter.pdfAssetKey}` : 'পিডিএফ লিঙ্ক যুক্ত নেই'}
                                    {chapter.pageCount ? ` • ${chapter.pageCount} পৃষ্ঠা` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {chapter.isPreview && (
                                  <span className="badge badge-accent text-[10px]">ফ্রি প্রিভিউ</span>
                                )}
                                <button
                                  onClick={() => setChapterModal({ open: true, contentId: item.id, chapter })}
                                  className="p-1.5 rounded text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors"
                                  title="অধ্যায় সম্পাদনা করুন"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(chapter.id)}
                                  className="p-1.5 rounded text-[#484f58] hover:text-[#f85149] hover:bg-[#f85149]/15 transition-colors"
                                  title="অধ্যায় মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-[#30363d] text-sm text-[#8b949e] hover:text-white disabled:opacity-40 transition-all">
            আগের
          </button>
          <span className="px-4 py-2 text-sm text-[#484f58]">{page}</span>
          <button onClick={() => setPage(page + 1)} disabled={items.length < 12}
            className="px-4 py-2 rounded-xl border border-[#30363d] text-sm text-[#8b949e] hover:text-white disabled:opacity-40 transition-all">
            পরের
          </button>
        </div>
      )}

      {/* Modals */}
      {formModal.open && (
        <ContentFormModal
          initial={formModal.item}
          onSave={formModal.item ? (d) => handleUpdate(formModal.item.id, d) : handleCreate}
          onClose={() => setFormModal({ open: false })}
        />
      )}
      {lessonModal.open && (
        <LessonFormModal
          contentId={lessonModal.contentId}
          initial={lessonModal.lesson}
          onClose={() => setLessonModal({ open: false, contentId: '' })}
          onSuccess={fetchContent}
        />
      )}
      {chapterModal.open && (
        <ChapterFormModal
          contentId={chapterModal.contentId}
          initial={chapterModal.chapter}
          onClose={() => setChapterModal({ open: false, contentId: '' })}
          onSuccess={fetchContent}
        />
      )}
    </div>
  );
}
