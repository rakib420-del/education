'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ExternalLink, MousePointerClick } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';

interface AffiliateOffer {
  id: string;
  titleBn: string;
  titleEn?: string;
  descriptionBn?: string;
  externalUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  clickCount: number;
  orderIndex: number;
  createdAt: string;
}

function AffiliateFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AffiliateOffer;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    titleBn:      initial?.titleBn      || '',
    titleEn:      initial?.titleEn      || '',
    descriptionBn:initial?.descriptionBn|| '',
    externalUrl:  initial?.externalUrl  || '',
    thumbnailUrl: initial?.thumbnailUrl || '',
    isActive:     initial?.isActive     ?? true,
    orderIndex:   initial?.orderIndex   ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        orderIndex: Number(form.orderIndex),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#30363d]">
          <h2 className="text-base font-bold text-white">
            {initial ? 'অফার সম্পাদনা' : 'নতুন অ্যাফিলিয়েট অফার'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#484f58] hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="form-label">শিরোনাম (বাংলা) *</label>
            <input className="form-input text-sm" placeholder="অফারের নাম..."
              value={form.titleBn} onChange={(e) => set('titleBn', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">শিরোনাম (ইংরেজি)</label>
            <input className="form-input text-sm" placeholder="English title"
              value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} />
          </div>
          <div>
            <label className="form-label">বিবরণ</label>
            <textarea className="form-input text-sm resize-none h-16"
              placeholder="সংক্ষিপ্ত বিবরণ..."
              value={form.descriptionBn} onChange={(e) => set('descriptionBn', e.target.value)} />
          </div>
          <div>
            <label className="form-label">বাহ্যিক লিঙ্ক *</label>
            <input type="url" className="form-input text-sm" placeholder="https://..."
              value={form.externalUrl} onChange={(e) => set('externalUrl', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">থাম্বনেইল URL</label>
            <input className="form-input text-sm" placeholder="https://..."
              value={form.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">ক্রম নম্বর</label>
              <input type="number" min="0" className="form-input text-sm"
                value={form.orderIndex} onChange={(e) => set('orderIndex', e.target.value)} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => set('isActive', !form.isActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-[#ff7a45]' : 'bg-[#30363d]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-[#8b949e]">সক্রিয়</span>
              </label>
            </div>
          </div>

          {/* Preview thumbnail if URL provided */}
          {form.thumbnailUrl && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1117]/60">
              <img src={form.thumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{form.titleBn || 'প্রিভিউ'}</p>
                <p className="text-[10px] text-[#484f58] truncate">{form.externalUrl}</p>
              </div>
            </div>
          )}

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

export default function AdminAffiliatePage() {
  const [offers, setOffers]       = useState<AffiliateOffer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [formModal, setFormModal] = useState<{ open: boolean; item?: AffiliateOffer }>({ open: false });

  const fetchOffers = useCallback(() => {
    setLoading(true);
    api.getAffiliate()
      .then(({ data }) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => toast.error('অফার লোড ব্যর্থ'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const handleCreate = async (data: any) => {
    await api.createAffiliateOffer(data);
    toast.success('অফার তৈরি হয়েছে');
    fetchOffers();
  };

  const handleUpdate = async (id: string, data: any) => {
    await api.updateAffiliateOffer(id, data);
    toast.success('অফার আপডেট হয়েছে');
    fetchOffers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই অফারটি মুছে ফেলবেন?')) return;
    try {
      await api.deleteAffiliateOffer(id);
      toast.success('মুছে ফেলা হয়েছে');
      fetchOffers();
    } catch {
      toast.error('মুছে ফেলা ব্যর্থ');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">অ্যাফিলিয়েট ব্যবস্থাপনা</h1>
          <p className="text-sm text-[#8b949e]">মোট {offers.length} টি অফার</p>
        </div>
        <button onClick={() => setFormModal({ open: true })} className="btn-primary py-2 px-4 text-sm">
          <Plus className="w-4 h-4" /> নতুন অফার
        </button>
      </div>

      {/* Offer grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="flex gap-3">
                <div className="w-14 h-14 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20 text-[#484f58]">
          <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>কোনো অ্যাফিলিয়েট অফার নেই</p>
          <button onClick={() => setFormModal({ open: true })} className="btn-primary mt-4 text-sm px-5 py-2.5">
            <Plus className="w-4 h-4" /> প্রথম অফার যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card p-4 group hover:border-[#ff7a45]/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                {/* Thumbnail */}
                {offer.thumbnailUrl ? (
                  <img src={offer.thumbnailUrl} alt=""
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-1 ring-[#30363d]" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#21262d] flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-5 h-5 text-[#484f58]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${offer.isActive ? 'bg-[#3fb950]' : 'bg-[#484f58]'}`} />
                    <span className={`text-[10px] font-medium ${offer.isActive ? 'text-[#3fb950]' : 'text-[#484f58]'}`}>
                      {offer.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                    <span className="text-[10px] text-[#484f58] ml-auto">#{offer.orderIndex}</span>
                  </div>
                  <p className="text-sm font-semibold text-white line-clamp-1">{offer.titleBn}</p>
                  {offer.descriptionBn && (
                    <p className="text-xs text-[#8b949e] line-clamp-1 mt-0.5">{offer.descriptionBn}</p>
                  )}
                </div>
              </div>

              {/* Click count */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0d1117]/60 mb-3">
                <MousePointerClick className="w-3.5 h-3.5 text-[#ff7a45]" />
                <span className="text-xs text-[#8b949e]">ক্লিক:</span>
                <span className="text-sm font-bold text-white">{offer.clickCount.toLocaleString('bn-BD')}</span>
              </div>

              {/* URL */}
              <a href={offer.externalUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#58a6ff] hover:underline truncate mb-3">
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{offer.externalUrl}</span>
              </a>

              {/* Actions */}
              <div className="flex gap-2 border-t border-[#30363d] pt-3">
                <button
                  onClick={() => setFormModal({ open: true, item: offer })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> সম্পাদনা
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[#484f58] hover:text-[#f85149] hover:bg-[#f85149]/15 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formModal.open && (
        <AffiliateFormModal
          initial={formModal.item}
          onSave={formModal.item ? (d) => handleUpdate(formModal.item!.id, d) : handleCreate}
          onClose={() => setFormModal({ open: false })}
        />
      )}
    </div>
  );
}
