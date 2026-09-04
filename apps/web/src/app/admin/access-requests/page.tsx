'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  KeyRound, CheckCircle, XCircle, Search,
  ChevronLeft, ChevronRight, UserPlus, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';
import { AccessStatus } from '@elearning/shared';

const STATUS_OPTIONS = [
  { value: '',                      label: 'সব'           },
  { value: AccessStatus.PENDING,    label: 'অপেক্ষামান'  },
  { value: AccessStatus.ACTIVE,     label: 'সক্রিয়'      },
  { value: AccessStatus.REVOKED,    label: 'বাতিলকৃত'   },
];

const statusStyle: Record<string, string> = {
  PENDING:  'badge badge-warning',
  ACTIVE:   'badge badge-success',
  REVOKED:  'badge badge-error',
};
const statusLabel: Record<string, string> = {
  PENDING: 'অপেক্ষামান', ACTIVE: 'সক্রিয়', REVOKED: 'বাতিলকৃত',
};

// Manual grant modal
function ManualGrantModal({ onGrant, onClose }: {
  onGrant: (userId: string, contentItemId: string) => Promise<void>;
  onClose: () => void;
}) {
  const [userId, setUserId]           = useState('');
  const [contentItemId, setContentId] = useState('');
  const [saving, setSaving]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onGrant(userId.trim(), contentItemId.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-white mb-1">ম্যানুয়াল অ্যাক্সেস প্রদান</h3>
        <p className="text-xs text-[#8b949e] mb-5">ব্যবহারকারী ও কনটেন্ট ID দিন। অর্ডার ছাড়াও অ্যাক্সেস দিতে পারবেন।</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">ব্যবহারকারী ইমেইল / ফোন / ID *</label>
            <input className="form-input text-sm font-mono" placeholder="k9413198@gmail.com বা User ID..."
              value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">কোর্স/বই Slug বা ID *</label>
            <input className="form-input text-sm font-mono" placeholder="c-un বা Content ID..."
              value={contentItemId} onChange={(e) => setContentId(e.target.value)} required />
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
              {saving ? '...' : 'অ্যাক্সেস দিন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAccessRequestsPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [grants, setGrants]       = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [grantModal, setGrantModal] = useState(false);

  const page   = Number(searchParams.get('page')   || 1);
  const status = searchParams.get('status') || '';

  const fetchGrants = useCallback(() => {
    setLoading(true);
    api.adminAccessGrants({ status: status || undefined, page, limit: 15 })
      .then(({ data }) => {
        setGrants(data.grants || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('অ্যাক্সেস গ্র্যান্ট লোড ব্যর্থ'))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchGrants(); }, [fetchGrants]);

  const setFilter = (val: string) => {
    const p = new URLSearchParams();
    if (val) p.set('status', val);
    p.set('page', '1');
    router.push(`/admin/access-requests?${p}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/access-requests?${params}`);
  };

  const handleActivate = async (grant: any) => {
    setActionId(grant.id);
    try {
      await api.grantAccess({ userId: grant.user.id, contentItemId: grant.contentItem.id });
      toast.success('অ্যাক্সেস সক্রিয় করা হয়েছে');
      fetchGrants();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সক্রিয় করা ব্যর্থ');
    } finally {
      setActionId(null);
    }
  };

  const handleRevoke = async (grant: any) => {
    if (!confirm('এই অ্যাক্সেস বাতিল করবেন?')) return;
    setActionId(grant.id);
    try {
      await api.revokeAccess({ userId: grant.user.id, contentItemId: grant.contentItem.id });
      toast.success('অ্যাক্সেস বাতিল করা হয়েছে');
      fetchGrants();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'বাতিল করা ব্যর্থ');
    } finally {
      setActionId(null);
    }
  };

  const handleManualGrant = async (userId: string, contentItemId: string) => {
    await api.grantAccess({ userId, contentItemId });
    toast.success('ম্যানুয়াল অ্যাক্সেস দেওয়া হয়েছে');
    fetchGrants();
  };

  const TYPE_LABEL: Record<string, string> = { COURSE: 'কোর্স', BOOK: 'বই', NOTE: 'নোট' };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">অ্যাক্সেস গ্র্যান্ট ব্যবস্থাপনা</h1>
          <p className="text-sm text-[#8b949e]">মোট {total} টি গ্র্যান্ট</p>
        </div>
        <button
          onClick={() => setGrantModal(true)}
          className="btn-primary py-2 px-4 text-sm self-start"
        >
          <UserPlus className="w-4 h-4" /> ম্যানুয়াল গ্র্যান্ট
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === value
                ? 'bg-[#ff7a45] text-white shadow-[0_0_15px_rgba(255,122,69,0.3)]'
                : 'bg-[#161b22] text-[#8b949e] border border-[#30363d] hover:border-[#ff7a45]/50 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#0d1117]/50">
                {['ব্যবহারকারী', 'কনটেন্ট', 'ধরন', 'অর্ডার', 'স্ট্যাটাস', 'সক্রিয় তারিখ', 'প্রদানকারী', 'অ্যাকশন'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 shimmer rounded" /></td>
                    ))}</tr>
                  ))
                : grants.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-[#484f58]">
                      <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      কোনো অ্যাক্সেস গ্র্যান্ট পাওয়া যায়নি
                    </td>
                  </tr>
                )
                : grants.map((grant) => (
                  <tr key={grant.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-[#e6edf3]">{grant.user?.name || '—'}</p>
                      <p className="text-[10px] text-[#484f58] font-mono">{grant.user?.phoneNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <p className="text-xs text-[#e6edf3] truncate">{grant.contentItem?.titleBn || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#8b949e]">{TYPE_LABEL[grant.contentItem?.type] || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {grant.order ? (
                        <span className="text-xs font-mono text-[#484f58]">#{grant.order.id.slice(-6).toUpperCase()}</span>
                      ) : (
                        <span className="text-xs text-[#484f58] italic">ম্যানুয়াল</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={statusStyle[grant.status] || 'badge'}>
                        {statusLabel[grant.status] || grant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#484f58] whitespace-nowrap">
                      {grant.activatedAt ? new Date(grant.activatedAt).toLocaleDateString('bn-BD') : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#484f58]">
                      {grant.admin?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {grant.status === AccessStatus.PENDING && (
                          <button
                            onClick={() => handleActivate(grant)}
                            disabled={actionId === grant.id}
                            className="p-1.5 rounded-lg text-[#3fb950] hover:bg-[#3fb950]/15 transition-all disabled:opacity-40"
                            title="সক্রিয় করুন"
                          >
                            {actionId === grant.id
                              ? <span className="w-3.5 h-3.5 border border-[#3fb950] border-t-transparent rounded-full animate-spin block" />
                              : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {grant.status === AccessStatus.ACTIVE && (
                          <button
                            onClick={() => handleRevoke(grant)}
                            disabled={actionId === grant.id}
                            className="p-1.5 rounded-lg text-[#f85149] hover:bg-[#f85149]/15 transition-all disabled:opacity-40"
                            title="বাতিল করুন"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {grant.status === AccessStatus.REVOKED && (
                          <button
                            onClick={() => handleActivate(grant)}
                            disabled={actionId === grant.id}
                            className="p-1.5 rounded-lg text-[#58a6ff] hover:bg-[#58a6ff]/15 transition-all disabled:opacity-40"
                            title="পুনরায় সক্রিয় করুন"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-[#30363d] px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-[#484f58]">পৃষ্ঠা {page} / {totalPages}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {grantModal && (
        <ManualGrantModal
          onGrant={handleManualGrant}
          onClose={() => setGrantModal(false)}
        />
      )}
    </div>
  );
}
