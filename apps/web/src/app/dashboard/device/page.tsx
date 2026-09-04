'use client';

import { useEffect, useState } from 'react';
import { Smartphone, ShieldAlert, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import { getOrCreateFingerprint } from '@/lib/utils';

export default function DevicePage() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentFp = getOrCreateFingerprint();

  useEffect(() => {
    api.getMe()
      .then(({ data }) => setDeviceInfo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isCurrentDevice = deviceInfo?.activeFingerprint === currentFp;

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">ডিভাইস ও সেশন ব্যবস্থাপনা</h1>
        <p className="text-[#8b949e] text-sm">সিঙ্গেল-ডিভাইস পলিসি ও আপনার সক্রিয় সেশন</p>
      </div>

      <div className="space-y-6">
        {/* Active Device Card */}
        <div className="glass-card p-6 border-l-4 border-l-[#ff7a45]">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff7a45]/15 flex items-center justify-center text-[#ff7a45]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">বর্তমানে সক্রিয় ডিভাইস</h3>
                <p className="text-xs text-[#8b949e]">একবারে কেবল একটি ডিভাইসে লগইন করা যাবে</p>
              </div>
            </div>
            {isCurrentDevice ? (
              <span className="badge badge-accent text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> বর্তমান ডিভাইস
              </span>
            ) : (
              <span className="badge text-xs bg-[#d29922]/20 text-[#d29922]">
                অন্য ডিভাইস
              </span>
            )}
          </div>

          <div className="bg-black/30 rounded-xl p-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#484f58]">Fingerprint Hash:</span>
              <span className="text-[#ff7a45] font-bold">
                {loading ? '...' : deviceInfo?.activeFingerprint ? `${deviceInfo.activeFingerprint.slice(0, 16)}...` : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#484f58]">User Agent:</span>
              <span className="text-[#8b949e] truncate max-w-[200px]">
                {typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Rule explanation */}
        <div className="glass-card p-6 space-y-3 text-sm text-[#c8d1da]">
          <h4 className="font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ff7a45]" />
            নিরাপত্তা নির্দেশিকা (Single-Device Enforcement)
          </h4>
          <ul className="space-y-2 list-disc list-inside text-xs text-[#8b949e] leading-relaxed">
            <li>কোর্সের বিষয়বস্তু পাইরেসি ও অবৈধ শেয়ারিং রোধে একক অ্যাকাউন্ট একটির বেশি ডিভাইসে একসঙ্গে ব্যবহার করা যাবে না।</li>
            <li>নতুন কোনো ফোনে বা পিসিতে লগইন করলে পূর্বের ডিভাইসটির সেশন স্বয়ংক্রিয়ভাবে নিষ্ক্রিয় হয়ে যাবে এবং পুনরায় OTP যাচাই করতে হবে।</li>
            <li>ডিভাইস পরিবর্তন সংক্রান্ত জটিলতা দেখা দিলে আমাদের সাপোর্ট টিমে যোগাযোগ করুন।</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
