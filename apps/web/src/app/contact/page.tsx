import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'যোগাযোগ করুন — শিক্ষা',
  description: 'শিক্ষা প্ল্যাটফর্মের সাথে যোগাযোগ করুন। যেকোনো প্রশ্ন বা সহায়তার জন্য আমরা সবসময় প্রস্তুত।',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white mb-3">যোগাযোগ করুন</h1>
          <p className="text-[#8b949e]">যেকোনো প্রশ্ন বা সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-white mb-4">যোগাযোগের তথ্য</h2>
            {[
              {
                icon: Phone,
                label: 'ফোন / WhatsApp',
                value: '+৮৮০ ১XXX-XXXXXX',
                desc: 'রবি–শনি, সকাল ৯টা – রাত ১০টা',
                color: '#3fb950',
              },
              {
                icon: Mail,
                label: 'ইমেইল',
                value: 'support@shikkha.com.bd',
                desc: '২৪ ঘণ্টার মধ্যে উত্তর পাবেন',
                color: '#58a6ff',
              },
              {
                icon: MessageCircle,
                label: 'Facebook Page',
                value: 'facebook.com/shikkhabd',
                desc: 'সবচেয়ে দ্রুত উত্তর পাবেন এখানে',
                color: '#bc8cff',
              },
              {
                icon: MapPin,
                label: 'ঠিকানা',
                value: 'ঢাকা, বাংলাদেশ',
                desc: 'সরাসরি সাক্ষাৎ: অ্যাপয়েন্টমেন্ট প্রয়োজন',
                color: '#ff7a45',
              },
            ].map(({ icon: Icon, label, value, desc, color }) => (
              <div key={label} className="glass-card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '18' }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-[#8b949e] mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                  <p className="text-xs text-[#484f58] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">সাধারণ জিজ্ঞাসা</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'পেমেন্ট করার পর কতক্ষণের মধ্যে অ্যাক্সেস পাব?',
                  a: 'সাধারণত ২–৬ ঘণ্টার মধ্যে। সর্বোচ্চ ২৪ ঘণ্টার মধ্যে আপনার নম্বরে SMS পাঠানো হবে।',
                },
                {
                  q: 'কোন পেমেন্ট পদ্ধতি সাপোর্ট করে?',
                  a: 'bKash, Nagad এবং Rocket সাপোর্ট করা হয়। "Send Money" নয়, "Payment" অপশন ব্যবহার করুন।',
                },
                {
                  q: 'কি একাধিক ডিভাইসে দেখা যাবে?',
                  a: 'না। নিরাপত্তার জন্য একটি অ্যাকাউন্ট একটি ডিভাইসে সক্রিয় থাকে। ডিভাইস পরিবর্তনের জন্য যোগাযোগ করুন।',
                },
                {
                  q: 'কনটেন্ট কতদিন দেখা যাবে?',
                  a: 'একবার অ্যাক্সেস পেলে সময়সীমা নেই — জীবনকালীন অ্যাক্সেস পাবেন।',
                },
                {
                  q: 'রিফান্ড পাওয়া যায় কি?',
                  a: 'হ্যাঁ, নির্দিষ্ট শর্তে। বিস্তারিত জানতে আমাদের রিফান্ড নীতি দেখুন।',
                },
              ].map(({ q, a }) => (
                <div key={q} className="glass-card p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">{q}</p>
                  <p className="text-xs text-[#8b949e] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
