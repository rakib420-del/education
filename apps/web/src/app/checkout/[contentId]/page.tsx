'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CreditCard, Upload, CheckCircle, AlertCircle,
  Copy, ShieldCheck, Clock, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { PaymentMethod } from '@elearning/shared';

type Tab = 'BKASH' | 'NAGAD';

const PAYMENT_INFO: Record<Tab, {
  name: string; color: string; bg: string;
  number: string; steps: string[];
}> = {
  BKASH: {
    name: 'বিকাশ', color: '#fff', bg: '#d82b8c',
    number: '01XXXXXXXXX',
    steps: [
      'বিকাশ অ্যাপ বা *247# ডায়াল করুন',
      '"Send Money" অপশন বেছে নিন',
      `মার্চেন্ট নম্বরে পাঠান: 01XXXXXXXXX`,
      'Amount লিখুন (নিচে দেখুন)',
      'Reference-এ আপনার মোবাইল নম্বর লিখুন',
      'PIN দিয়ে নিশ্চিত করুন',
    ],
  },
  NAGAD: {
    name: 'নগদ', color: '#fff', bg: '#e2231a',
    number: '01XXXXXXXXX',
    steps: [
      'নগদ অ্যাপ বা *167# ডায়াল করুন',
      '"Send Money" অপশন বেছে নিন',
      'মার্চেন্ট নম্বরে পাঠান: 01XXXXXXXXX',
      'সঠিক পরিমাণ লিখুন',
      'Reference-এ আপনার নাম লিখুন',
      'PIN দিয়ে কনফার্ম করুন',
    ],
  },
};

export default function CheckoutPage() {
  const { contentId } = useParams<{ contentId: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [content, setContent] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('BKASH');
  const [txnId, setTxnId] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const price = content ? (content.discountPrice ?? content.price) : 0;
  const info = PAYMENT_INFO[tab];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=/checkout/${contentId}`);
    }
  }, [isAuthenticated, isLoading, contentId, router]);

  useEffect(() => {
    if (!contentId) return;
    // Fetch content by ID (works for both ID and slug via the content controller)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/${contentId}`)
      .then((r) => r.json())
      .then(setContent)
      .catch(() => {});
  }, [contentId]);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error('ফাইল সাইজ ৫MB এর বেশি হবে না'); return; }
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const isFree = price === 0;
    if (!isFree && !txnId.trim()) { toast.error('ট্রানজেকশন আইডি দিন'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('contentItemId', content?.id || contentId);
      formData.append('paymentMethod', tab);
      formData.append('transactionId', txnId.trim() || (isFree ? 'FREE' : ''));
      if (proofFile) formData.append('paymentProof', proofFile);
      await api.createOrder(formData);
      setSubmitted(true);
      toast.success(isFree ? 'বিনামূল্যের কোর্সে সফলভাবে এনরোল করেছেন!' : 'অর্ডার গ্রহণ করা হয়েছে!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" /></div>;

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-[#3fb950]/15 border-2 border-[#3fb950] flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#3fb950]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          {price === 0 ? 'এনরোলমেন্ট সফল হয়েছে!' : 'অর্ডার গ্রহণ হয়েছে!'}
        </h2>
        <p className="text-[#8b949e] leading-relaxed mb-6">
          {price === 0
            ? 'আপনার কোর্সে সফলভাবে এনরোল করা হয়েছে। এখন থেকেই পাঠ শুরু করতে পারেন।'
            : 'আপনার পেমেন্ট যাচাই করার পর আমাদের টিম ২৪ ঘণ্টার মধ্যে আপনার মোবাইলে SMS পাঠাবে এবং কোর্সে প্রবেশাধিকার দেওয়া হবে।'}
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push(price === 0 ? `/learn/${content?.slug || contentId}` : '/dashboard/orders')} className="btn-primary w-full py-3">
            {price === 0 ? 'কোর্সে প্রবেশ করুন' : 'অর্ডার ট্র্যাক করুন'}
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary w-full py-3">
            হোমপেজে যান
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="section container-main max-w-4xl">
      <div className="mb-8">
        <div className="divider" />
        <h1 className="section-title">{price === 0 ? 'কোর্স এনরোলমেন্ট' : 'পেমেন্ট করুন'}</h1>
        {content && (
          <p className="text-[#8b949e]">
            {content.titleBn} — <span className="text-[#ff7a45] font-bold">{price === 0 ? 'বিনামূল্যে' : formatPrice(price)}</span>
          </p>
        )}
      </div>

      {price === 0 ? (
        <div className="glass-card p-8 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#3fb950]/15 text-[#3fb950] border-2 border-[#3fb950] flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">সম্পূর্ণ বিনামূল্যে এনরোল করুন</h2>
            <p className="text-[#8b949e] text-sm leading-relaxed">
              এই কোর্সটিতে অংশ নিতে কোনো পেমেন্ট তথ্যের প্রয়োজন নেই। নিচের বাটনে ক্লিক করেই অবিলম্বে প্রবেশাধিকার পাবেন।
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                এনরোল করা হচ্ছে...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                বিনামূল্যে এনরোল করুন
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Payment method + instructions */}
          <div className="lg:col-span-3 space-y-6">

            {/* Method tabs */}
            <div className="glass-card p-5">
              <p className="text-sm font-medium text-[#8b949e] mb-4">পেমেন্ট পদ্ধতি বেছে নিন</p>
              <div className="flex gap-3 flex-wrap">
                {(['BKASH', 'NAGAD'] as Tab[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setTab(m)}
                    className={`payment-tab ${m.toLowerCase()} ${tab === m ? 'active' : ''}`}
                  >
                    <span className="text-sm font-bold">{PAYMENT_INFO[m].name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: info.bg + '20', border: `1px solid ${info.bg}40` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: info.bg }}>
                  <CreditCard className="w-5 h-5" style={{ color: info.color }} />
                </div>
                <div>
                  <p className="font-bold text-white">{info.name} নম্বর</p>
                  <div className="flex items-center gap-2">
                    <code className="text-[#ff7a45] font-mono text-sm">{info.number}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(info.number); toast.success('কপি হয়েছে!'); }}
                      className="text-[#484f58] hover:text-[#8b949e] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#8b949e]">পরিমাণ</p>
                  <p className="text-lg font-extrabold text-white">{formatPrice(price)}</p>
                </div>
              </div>

              <ol className="space-y-3">
                {info.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff7a45]/15 border border-[#ff7a45]/30 text-[#ff7a45] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-[#c8d1da]">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: transaction ID + proof */}
          <div className="lg:col-span-2 space-y-5">
            {/* Transaction ID input */}
            <div className="glass-card p-5">
              <label className="form-label" htmlFor="txn-id">
                ট্রানজেকশন আইডি (TxnID) *
              </label>
              <input
                id="txn-id"
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="form-input"
                placeholder="উদা: TXN1234567890"
              />
              <p className="text-xs text-[#484f58] mt-2">
                পেমেন্ট সফল হলে {info.name} থেকে একটি SMS আসবে — সেখানে Transaction ID থাকে।
              </p>
            </div>

            {/* Screenshot upload */}
            <div className="glass-card p-5">
              <label className="form-label">পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#30363d] rounded-xl p-6 text-center cursor-pointer hover:border-[#ff7a45]/50 transition-all group"
              >
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} alt="proof" className="max-h-40 mx-auto rounded-lg mb-2 object-contain" />
                    <p className="text-xs text-[#3fb950]">✓ আপলোড করা হয়েছে</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-[#484f58] group-hover:text-[#ff7a45] mx-auto mb-2 transition-colors" />
                    <p className="text-sm text-[#8b949e]">ক্লিক করুন বা ছবি টেনে আনুন</p>
                    <p className="text-xs text-[#484f58] mt-1">JPG, PNG — সর্বোচ্চ ৫MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>

            {/* Warning */}
            <div className="flex gap-3 p-4 rounded-xl bg-[#d29922]/10 border border-[#d29922]/20">
              <AlertCircle className="w-4 h-4 text-[#d29922] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#d29922]">
                সঠিক ট্রানজেকশন আইডি দিন। ভুল তথ্য দিলে অর্ডার প্রত্যাখ্যাত হতে পারে।
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!txnId.trim() || submitting}
              className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  জমা দেওয়া হচ্ছে...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  অর্ডার জমা দিন
                </>
              )}
            </button>
            <p className="text-xs text-[#484f58] text-center">
              যাচাইয়ের পর SMS/নোটিফিকেশন পাবেন
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
