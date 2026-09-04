'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Play, ShoppingCart, CheckCircle, Loader2, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';

interface Props {
  courseId: string;
  slug?: string;
  price?: number;
  firstLessonId?: string;
  firstChapterId?: string;
  isCourse: boolean;
  initialHasAccess?: boolean;
  initialHasPendingOrder?: boolean;
}

export function CourseEnrollButton({
  courseId,
  slug,
  price,
  firstLessonId,
  firstChapterId,
  isCourse,
  initialHasAccess = false,
  initialHasPendingOrder = false,
}: Props) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(initialHasAccess);
  const [hasPendingOrder, setHasPendingOrder] = useState(initialHasPendingOrder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const identifier = slug || courseId;
    if (!identifier) return;

    // Check with backend using student bearer token via getContentBySlug
    api.getContentBySlug(identifier)
      .then(({ data }) => {
        if (data?.hasAccess) {
          setHasAccess(true);
          setHasPendingOrder(false);
        } else if (data?.hasPendingOrder) {
          setHasPendingOrder(true);
        }
      })
      .catch(() => {});

    // Fallback checks
    api.getMyOrders()
      .then(({ data }) => {
        const userOrders = Array.isArray(data) ? data : [];
        const foundPending = userOrders.some(
          (o: any) =>
            (o.contentItem?.id === courseId || o.contentItem?.slug === courseId || (slug && o.contentItem?.slug === slug)) &&
            o.status === 'PENDING'
        );
        if (foundPending) setHasPendingOrder(true);
      })
      .catch(() => {});

    api.getMyContent()
      .then(({ data }) => {
        const userContents = Array.isArray(data) ? data : [];
        const foundAccess = userContents.some(
          (item: any) => item.contentItem?.id === courseId || item.contentItem?.slug === courseId || (slug && item.contentItem?.slug === slug)
        );
        if (foundAccess) setHasAccess(true);
      })
      .catch(() => {});
  }, [courseId, slug]);

  const targetUrl = isCourse
    ? (firstLessonId ? `/learn/${courseId}/${firstLessonId}` : `/learn/${courseId}`)
    : (firstChapterId ? `/read/${courseId}/${firstChapterId}` : `/read/${courseId}`);

  if (hasAccess) {
    return (
      <Link
        href={targetUrl}
        className="btn-primary w-full text-center py-3.5 text-base block"
      >
        <Play className="w-4 h-4 inline mr-2" />
        {isCourse ? 'কোর্স শুরু করুন' : 'পড়া শুরু করুন'}
      </Link>
    );
  }

  if (hasPendingOrder) {
    return (
      <Link
        href="/dashboard/orders"
        className="w-full text-center py-3.5 px-4 text-sm font-semibold rounded-xl block transition-all"
        style={{
          background: 'rgba(210, 153, 34, 0.15)',
          color: '#d29922',
          border: '1px solid rgba(210, 153, 34, 0.3)',
        }}
      >
        <Clock className="w-4 h-4 inline mr-2" />
        অর্ডার অপেক্ষমাণ (যাচাই চলছে)
      </Link>
    );
  }

  const handleFreeEnroll = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('contentItemId', courseId);
      formData.append('paymentMethod', 'BKASH');
      formData.append('transactionId', 'FREE');
      await api.createOrder(formData);
      toast.success('বিনামূল্যের কোর্সে সফলভাবে এনরোল করা হয়েছে!');
      setHasAccess(true);
      router.push(targetUrl);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push(`/login?redirect=/courses/${courseId}`);
      } else {
        toast.error(err?.response?.data?.message || 'এনরোল করতে সমস্যা হয়েছে');
      }
    } finally {
      setLoading(false);
    }
  };

  if (price === 0) {
    return (
      <button
        onClick={handleFreeEnroll}
        disabled={loading}
        className="btn-primary w-full text-center py-3.5 text-base flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            এনরোল করা হচ্ছে...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            বিনামূল্যে এনরোল করুন
          </>
        )}
      </button>
    );
  }

  return (
    <Link
      href={`/checkout/${courseId}`}
      className="btn-primary w-full text-center py-3.5 text-base block"
    >
      <ShoppingCart className="w-4 h-4 inline mr-2" />
      {isCourse ? 'কোর্সে ভর্তি হোন' : 'কিনুন'}
    </Link>
  );
}


