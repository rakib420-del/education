import type { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, Users, BookOpen, Shield, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'আমাদের সম্পর্কে — শিক্ষা',
  description: 'শিক্ষা প্ল্যাটফর্ম সম্পর্কে জানুন। বাংলাদেশের শিক্ষার্থীদের জন্য সেরা অনলাইন শিক্ষা সমাধান।',
};

const stats = [
  { icon: Users,       value: '৫০,০০০+', label: 'শিক্ষার্থী' },
  { icon: BookOpen,    value: '২০০+',     label: 'কোর্স ও বই' },
  { icon: GraduationCap, value: '৫০+',   label: 'বিশেষজ্ঞ শিক্ষক' },
  { icon: Heart,       value: '৪.৮/৫',   label: 'গড় রেটিং' },
];

const values = [
  { title: 'মানসম্মত শিক্ষা', desc: 'বিশেষজ্ঞ শিক্ষকদের তৈরি উচ্চমানের কোর্স, প্রতিটি পাঠ সুশৃঙ্খলভাবে সাজানো।' },
  { title: 'সাশ্রয়ী মূল্য',   desc: 'বাংলাদেশের শিক্ষার্থীদের কথা মাথায় রেখে সাশ্রয়ী মূল্যে সেরা শিক্ষা উপকরণ।' },
  { title: 'নিরাপদ পরিবেশ',  desc: 'কনটেন্ট সুরক্ষিত এবং শুধুমাত্র যাচাইকৃত শিক্ষার্থীরাই অ্যাক্সেস পাবেন।' },
  { title: 'সার্বক্ষণিক সহায়তা', desc: '২৪/৭ সাপোর্ট টিম সবসময় আপনার পাশে।' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#ff7a45]/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff7a45]/15 text-[#ff7a45] text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            শিক্ষার প্রতি আমাদের অঙ্গীকার
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            বাংলাদেশের সেরা<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7a45] to-[#e8612a]">
              অনলাইন শিক্ষা প্ল্যাটফর্ম
            </span>
          </h1>
          <p className="text-lg text-[#8b949e] leading-relaxed max-w-2xl mx-auto">
            আমরা বিশ্বাস করি মানসম্মত শিক্ষা সবার নাগালে থাকা উচিত। সেই লক্ষ্যে আমরা দেশের সেরা শিক্ষকদের সাথে মিলে তৈরি করেছি এই প্ল্যাটফর্ম।
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[#30363d] bg-[#0d1117]/40">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <div className="w-12 h-12 rounded-2xl bg-[#ff7a45]/15 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-6 h-6 text-[#ff7a45]" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
              <p className="text-sm text-[#8b949e]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">আমাদের লক্ষ্য</h2>
          <p className="text-[#8b949e] text-center leading-relaxed mb-12">
            প্রতিটি বাংলাদেশি শিক্ষার্থীর কাছে মানসম্মত ডিজিটাল শিক্ষা পৌঁছে দেওয়া — এটাই আমাদের মূল লক্ষ্য।
            ইন্টারনেট সংযোগ আর একটি স্মার্টফোন দিয়েই যেন যে কেউ বিশ্বমানের শিক্ষা পেতে পারেন।
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(({ title, desc }) => (
              <div key={title} className="glass-card p-6">
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#8b949e] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center border-t border-[#30363d]">
        <h2 className="text-xl font-bold text-white mb-3">আজই শুরু করুন</h2>
        <p className="text-sm text-[#8b949e] mb-6">হাজারো শিক্ষার্থীর সাথে যোগ দিন</p>
        <div className="flex justify-center gap-3">
          <Link href="/courses" className="btn-primary px-6 py-3">কোর্স দেখুন</Link>
          <Link href="/register" className="btn-secondary px-6 py-3">নিবন্ধন করুন</Link>
        </div>
      </section>
    </div>
  );
}
