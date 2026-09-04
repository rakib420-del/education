import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'রিফান্ড নীতি — শিক্ষা',
  description: 'শিক্ষা প্ল্যাটফর্মের রিফান্ড ও ফেরত নীতি। কখন এবং কীভাবে রিফান্ড পাওয়া যায়।',
};

const eligible = [
  'পেমেন্ট সফল হয়েছে কিন্তু ৭২ ঘণ্টার মধ্যে অ্যাক্সেস সক্রিয় হয়নি (আমাদের ত্রুটির কারণে)।',
  'কোর্সটি বিজ্ঞাপনে দাবি করা বিষয়বস্তুর চেয়ে উল্লেখযোগ্যভাবে ভিন্ন।',
  'প্রযুক্তিগত সমস্যায় কনটেন্ট সম্পূর্ণ অনুপলব্ধ এবং ৭ দিনেও সমাধান হয়নি।',
  'ভুলবশত একই কনটেন্টে দ্বিতীয়বার পেমেন্ট করা হয়েছে।',
];

const ineligible = [
  'কনটেন্ট অ্যাক্সেস করার পর (যেকোনো পাঠ দেখা হয়েছে)।',
  'পেমেন্টের ৭ দিনের বেশি সময় পার হয়ে গেলে।',
  'ভুল ট্রানজেকশন আইডি বা ভুল স্ক্রিনশট দেওয়ার কারণে প্রত্যাখ্যাত হলে।',
  '"কোর্সটি ভালো লাগেনি" বা "অন্য কোর্স নিতে চাই" — এসব কারণে।',
  'ডিভাইস পরিবর্তন বা ইন্টারনেট সমস্যার কারণে।',
  'শর্ত লঙ্ঘনের কারণে অ্যাকাউন্ট বাতিল হলে।',
];

const steps = [
  { step: '১', title: 'যোগাযোগ করুন', desc: 'support@shikkha.com.bd বা Facebook-এ মেসেজ করুন।' },
  { step: '২', title: 'তথ্য প্রদান করুন', desc: 'অর্ডার আইডি, ট্রানজেকশন আইডি এবং রিফান্ডের কারণ জানান।' },
  { step: '৩', title: 'যাচাই', desc: 'আমাদের টিম ৩–৫ কার্যদিবসের মধ্যে যাচাই করবে।' },
  { step: '৪', title: 'রিফান্ড প্রক্রিয়া', desc: 'অনুমোদিত হলে ৭–১০ কার্যদিবসের মধ্যে মূল পেমেন্ট পদ্ধতিতে ফেরত পাঠানো হবে।' },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white mb-3">রিফান্ড নীতি</h1>
          <p className="text-[#8b949e] text-sm">সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬</p>
        </div>

        {/* Important notice */}
        <div className="flex items-start gap-3 p-5 rounded-2xl bg-[#d29922]/10 border border-[#d29922]/30 mb-8">
          <AlertTriangle className="w-5 h-5 text-[#d29922] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#d29922] leading-relaxed">
            আমাদের পেমেন্ট ম্যানুয়ালি যাচাই করা হয়। রিফান্ডের অনুরোধ করার আগে অনুগ্রহ করে পুরো নীতিটি পড়ুন।
          </p>
        </div>

        {/* Eligible */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#3fb950]" />
            রিফান্ড পাওয়া যাবে (যোগ্য কারণ)
          </h2>
          <ul className="space-y-3">
            {eligible.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#8b949e]">
                <span className="w-5 h-5 rounded-full bg-[#3fb950]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-[#3fb950]" />
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not eligible */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#f85149]" />
            রিফান্ড পাওয়া যাবে না (অযোগ্য কারণ)
          </h2>
          <ul className="space-y-3">
            {ineligible.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#8b949e]">
                <span className="w-5 h-5 rounded-full bg-[#f85149]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-3 h-3 text-[#f85149]" />
                </span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Process */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-5 text-center">রিফান্ড প্রক্রিয়া</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="glass-card p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#ff7a45]/15 flex items-center justify-center flex-shrink-0 font-bold text-[#ff7a45] text-sm">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">{title}</p>
                  <p className="text-xs text-[#8b949e] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important notes */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">গুরুত্বপূর্ণ তথ্য</h2>
          <ul className="space-y-2 text-xs text-[#8b949e]">
            <li className="flex items-start gap-2"><span className="text-[#ff7a45]">•</span> রিফান্ড শুধুমাত্র মূল পেমেন্ট পদ্ধতিতে (bKash/Nagad) প্রদান করা হয়।</li>
            <li className="flex items-start gap-2"><span className="text-[#ff7a45]">•</span> রিফান্ড অনুমোদিত হলে কনটেন্ট অ্যাক্সেস স্বয়ংক্রিয়ভাবে বাতিল হবে।</li>
            <li className="flex items-start gap-2"><span className="text-[#ff7a45]">•</span> জালিয়াতির সন্দেহ থাকলে আমরা অতিরিক্ত যাচাই করার অধিকার রাখি।</li>
            <li className="flex items-start gap-2"><span className="text-[#ff7a45]">•</span> রিফান্ড প্রক্রিয়ায় গেটওয়ে চার্জ কাটা হতে পারে (সর্বোচ্চ ১.৫%)।</li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#8b949e] mb-4">রিফান্ডের অনুরোধ করতে বা আরও জানতে</p>
          <Link href="/contact" className="btn-primary px-6 py-3 text-sm">যোগাযোগ করুন</Link>
        </div>
      </div>
    </div>
  );
}
