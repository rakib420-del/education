'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag, CheckCircle, XCircle, Clock, Eye,
  ChevronLeft, ChevronRight, Search, ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';
import { OrderStatus, OrderStatusLabelBn, PaymentMethodLabel, PaymentMethod } from '@elearning/shared';

const STATUS_OPTIONS = [
  { value: '',                    label: 'সব অর্ডার' },
  { value: OrderStatus.PENDING,   label: 'অপেক্ষামান' },
  { value: OrderStatus.VERIFIED,  label: 'যাচাইকৃত'  },
  { value: OrderStatus.REJECTED,  label: 'প্রত্যাখ্যাত' },
];

const statusStyles: Record<string, string> = {
  PENDING:  'badge badge-warning',
  VERIFIED: 'badge badge-success',
  REJECTED: 'badge badge-error',
};

function RejectModal({
  orderId,
  onConfirm,
  onClose,
}: {
  orderId: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-white mb-2">অর্ডার প্রত্যাখ্যান</h3>
        <p className="text-sm text-[#8b949e] mb-4">কারণ উল্লেখ করুন (ঐচ্ছিক)</p>
        <textarea
          className="form-input resize-none h-24 mb-4"
          placeholder="প্রত্যাখ্যানের কারণ..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
          <button
            onClick={() => onConfirm(reason)}
            className="flex-1 py-2.5 text-sm rounded-xl font-semibold bg-[#f85149] text-white hover:bg-[#d73a49] transition-colors"
          >
            প্রত্যাখ্যান করুন
          </button>
        </div>
      </div>
    </div>
  );
}

function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt="Payment proof" className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]" />
        <button onClick={onClose} className="mt-4 btn-secondary w-full text-sm py-2.5">বন্ধ করুন</button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orders, setOrders]       = useState<any[]>([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [actionId, setActionId]   = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [proofUrl, setProofUrl]   = useState<string | null>(null);

  const page   = Number(searchParams.get('page')   || 1);
  const status = (searchParams.get('status') || '') as OrderStatus | '';

  const fetchOrders = useCallback(() => {
    setLoading(true);
    api.adminOrders({ status: status || undefined, page, limit: 15 })
      .then(({ data }) => {
        setOrders(data.orders || data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('অর্ডার লোড ব্যর্থ'))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setFilter = (val: string) => {
    const params = new URLSearchParams();
    if (val) params.set('status', val);
    params.set('page', '1');
    router.push(`/admin/orders?${params}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/orders?${params}`);
  };

  const handleVerify = async (id: string) => {
    setActionId(id);
    try {
      await api.verifyOrder(id);
      toast.success('অর্ডার যাচাই করা হয়েছে');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'যাচাই ব্যর্থ');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    const id = rejectTarget;
    setRejectTarget(null);
    setActionId(id);
    try {
      await api.rejectOrder(id, reason);
      toast.success('অর্ডার প্রত্যাখ্যাত হয়েছে');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'প্রত্যাখ্যান ব্যর্থ');
    } finally {
      setActionId(null);
    }
  };

  const handleViewProof = async (id: string) => {
    try {
      const { data } = await api.getProofUrl(id);
      setProofUrl(data.url || data.signedUrl || data.proofUrl);
    } catch {
      toast.error('পেমেন্ট প্রমাণ লোড ব্যর্থ');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">অর্ডার ব্যবস্থাপনা</h1>
          <p className="text-sm text-[#8b949e]">মোট {total.toLocaleString('bn-BD')} টি অর্ডার</p>
        </div>
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
                {['অর্ডার', 'ব্যবহারকারী', 'কনটেন্ট', 'পরিমাণ', 'পেমেন্ট', 'স্ট্যাটাস', 'তারিখ', 'অ্যাকশন'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#8b949e] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-4 shimmer rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-[#484f58]">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      কোনো অর্ডার পাওয়া যায়নি
                    </td>
                  </tr>
                )
                : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-[#484f58]">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[#e6edf3] font-medium text-xs">{order.user?.name || '—'}</p>
                      <p className="text-[#484f58] text-[10px]">{order.user?.phoneNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <p className="text-[#e6edf3] text-xs truncate">{order.contentItem?.titleBn || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#3fb950] font-semibold whitespace-nowrap">
                      ৳{Number(order.pricePaid).toLocaleString('bn-BD')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#8b949e]">
                        {PaymentMethodLabel[order.paymentMethod as PaymentMethod] || order.paymentMethod}
                      </span>
                      <p className="text-[10px] text-[#484f58] font-mono">{order.transactionId}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={statusStyles[order.status] || 'badge'}>
                        {OrderStatusLabelBn[order.status as OrderStatus] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#484f58] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* View proof */}
                        <button
                          onClick={() => handleViewProof(order.id)}
                          className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
                          title="পেমেন্ট প্রমাণ দেখুন"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleVerify(order.id)}
                          disabled={actionId === order.id}
                          className="p-1.5 rounded-lg text-[#3fb950] hover:bg-[#3fb950]/15 transition-all disabled:opacity-50"
                          title="যাচাই ও অ্যাক্সেস সক্রিয় করুন"
                        >
                          {actionId === order.id
                            ? <span className="w-3.5 h-3.5 border border-[#3fb950] border-t-transparent rounded-full animate-spin block" />
                            : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                        {order.status === OrderStatus.PENDING && (
                          <button
                            onClick={() => setRejectTarget(order.id)}
                            disabled={actionId === order.id}
                            className="p-1.5 rounded-lg text-[#f85149] hover:bg-[#f85149]/15 transition-all disabled:opacity-50"
                            title="প্রত্যাখ্যান করুন"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-[#30363d] px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-[#484f58]">পৃষ্ঠা {page} / {totalPages}</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          orderId={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}
      {proofUrl && <ProofModal url={proofUrl} onClose={() => setProofUrl(null)} />}
    </div>
  );
}
