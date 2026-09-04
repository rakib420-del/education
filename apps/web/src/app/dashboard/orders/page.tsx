'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { OrderStatus } from '@elearning/shared';
import { ShoppingBag, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then(({ data }) => setOrders(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.VERIFIED:
        return (
          <span className="status-badge status-verified flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> যাচাইকৃত (সক্রিয়)
          </span>
        );
      case OrderStatus.REJECTED:
        return (
          <span className="status-badge status-rejected flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> প্রত্যাখ্যাত
          </span>
        );
      case OrderStatus.PENDING:
      default:
        return (
          <span className="status-badge status-pending flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> অপেক্ষামান (যাচাই চলছে)
          </span>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">অর্ডার ইতিহাস</h1>
        <p className="text-[#8b949e] text-sm">আপনার সমস্ত পেমেন্ট ও অনুমোদনের অবস্থা দেখুন</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-5 h-24 shimmer" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-[#484f58] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">কোনো অর্ডার পাওয়া যায়নি</h3>
          <p className="text-[#8b949e] text-sm">আপনি এখনও কোনো কোর্স বা বই ক্রয় করেননি</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#484f58]">ID: #{order.id.slice(-8)}</span>
                  {getStatusBadge(order.status)}
                </div>
                <h3 className="font-semibold text-white text-base">
                  {order.contentItem?.titleBn || 'কোর্স / বই'}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                  <span>পেমেন্ট: <strong className="text-white">{order.paymentMethod}</strong></span>
                  <span>TxnID: <code className="text-[#ff7a45]">{order.transactionId}</code></span>
                  <span>তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#30363d]">
                <div className="text-right">
                  <p className="text-xs text-[#8b949e]">পরিশোধিত মূল্য</p>
                  <p className="text-lg font-extrabold text-white">
                    {formatPrice(Number(order.pricePaid))}
                  </p>
                </div>
                {order.adminNote && (
                  <div className="text-xs text-[#f85149] bg-[#f85149]/10 p-2 rounded-lg max-w-xs">
                    নোট: {order.adminNote}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
