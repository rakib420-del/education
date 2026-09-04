'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users, Search, UserX, UserCheck, LogOut, Trash2,
  ChevronLeft, ChevronRight, Laptop, X, RefreshCw, KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api-client';

function ConfirmModal({
  title, desc, confirmLabel, confirmClass,
  onConfirm, onClose,
}: {
  title: string; desc: string;
  confirmLabel: string; confirmClass?: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-sm">
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-[#8b949e] mb-5">{desc}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">বাতিল</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 text-sm rounded-xl font-semibold text-white transition-colors ${confirmClass || 'bg-[#f85149] hover:bg-[#d73a49]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function DevicesModal({
  user, onClose
}: {
  user: any; onClose: () => void;
}) {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDevices = useCallback(() => {
    setLoading(true);
    api.adminGetUserDevices(user.id)
      .then(({ data }) => setDevices(data || []))
      .catch(() => toast.error('ডিভাইস তালিকা লোড করতে ব্যর্থ'))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const toggleDeviceBlock = async (device: any) => {
    setUpdatingId(device.id);
    try {
      if (device.isBlocked) {
        await api.adminUnblockDevice(device.id);
        toast.success('ডিভাইস আনব্লক করা হয়েছে');
      } else {
        await api.adminBlockDevice(device.id);
        toast.success('ডিভাইস ব্লক করা হয়েছে');
      }
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'ডিভাইস আপডেট ব্যর্থ');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4 border-b border-[#30363d] pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-[#ff7a45]" />
              ডিভাইস / ড্রাইভ ব্যবস্থাপনা
            </h3>
            <p className="text-xs text-[#8b949e]">{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#8b949e] text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
            ডিভাইস তালিকা লোড হচ্ছে...
          </div>
        ) : devices.length === 0 ? (
          <div className="py-8 text-center text-[#484f58] text-sm">
            কোনো ডিভাইস পাওয়া যায়নি
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {devices.map((device) => (
              <div key={device.id} className="p-3 rounded-xl bg-[#0d1117]/60 border border-[#30363d] flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white truncate max-w-[200px]" title={device.deviceFingerprint}>
                      {device.deviceFingerprint}
                    </span>
                    {device.isBlocked ? (
                      <span className="badge badge-error text-[10px] py-0 px-1.5">ব্লকড</span>
                    ) : (
                      <span className="badge badge-success text-[10px] py-0 px-1.5">সক্রিয়</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8b949e] truncate mt-0.5" title={device.userAgent || ''}>
                    {device.userAgent || 'অজানা User Agent'}
                  </p>
                  <p className="text-[10px] text-[#484f58] mt-0.5">
                    শেষ লগইন: {new Date(device.lastLoginAt).toLocaleString('bn-BD')}
                  </p>
                </div>

                <button
                  onClick={() => toggleDeviceBlock(device)}
                  disabled={updatingId === device.id}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
                    device.isBlocked
                      ? 'bg-[#3fb950]/20 text-[#3fb950] hover:bg-[#3fb950]/30'
                      : 'bg-[#f85149]/20 text-[#f85149] hover:bg-[#f85149]/30'
                  }`}
                >
                  {device.isBlocked ? 'আনব্লক করুন' : 'ব্লক করুন'}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="btn-secondary py-2 px-5 text-sm">
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [users, setUsers]           = useState<any[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState<string | null>(null);
  const [selectedDeviceUser, setSelectedDeviceUser] = useState<any | null>(null);
  const [confirm, setConfirm]       = useState<{
    id: string; action: 'block' | 'unblock' | 'logout' | 'delete';
  } | null>(null);

  const page   = Number(searchParams.get('page')   || 1);
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.adminUsers({ page, limit: 15, search: search || undefined })
      .then(({ data }) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => toast.error('ব্যবহারকারী লোড ব্যর্থ'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/admin/users?${params}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    params.set('page', '1');
    router.push(`/admin/users?${params}`);
  };

  const executeAction = async (id: string, action: 'block' | 'unblock' | 'logout' | 'delete') => {
    setActionId(id);
    try {
      if (action === 'block')   await api.blockUser(id);
      if (action === 'unblock') await api.unblockUser(id);
      if (action === 'logout')  await api.forceLogout(id);
      if (action === 'delete')  await api.adminDeleteUser(id);

      const msgs = {
        block:   'ব্যবহারকারী ব্লক করা হয়েছে',
        unblock: 'ব্লক তুলে নেওয়া হয়েছে',
        logout:  'সকল সেশন বাতিল করা হয়েছে',
        delete:  'অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলা হয়েছে',
      };
      toast.success(msgs[action]);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'অ্যাকশন ব্যর্থ');
    } finally {
      setActionId(null);
    }
  };

  const confirmAction = (id: string, action: 'block' | 'unblock' | 'logout' | 'delete') => {
    setConfirm({ id, action });
  };

  const confirmMeta: Record<string, { title: string; desc: string; label: string; cls?: string }> = {
    block:   { title: 'ব্যবহারকারী ব্লক', desc: 'এই ব্যবহারকারীকে ব্লক করলে সে কোনো ফিচার অ্যাক্সেস করতে পারবে না।', label: 'ব্লক করুন' },
    unblock: { title: 'ব্লক তুলুন', desc: 'এই ব্যবহারকারীকে আবার সক্রিয় করা হবে।', label: 'ব্লক তুলুন', cls: 'bg-[#3fb950] hover:bg-[#2ea043]' },
    logout:  { title: 'ফোর্স লগআউট', desc: 'এই ব্যবহারকারীর সকল সক্রিয় ডিভাইস সেশন বাতিল হবে।', label: 'লগআউট করুন' },
    delete:  { title: 'অ্যাকাউন্ট ডিলিট করুন', desc: 'এই ব্যবহারকারী এবং তার সম্পর্কিত সকল ডাটা স্থায়ীভাবে মুছে যাবে। এটি আর ফেরত আনা যাবে না।', label: 'ডিলিট করুন', cls: 'bg-[#f85149] hover:bg-[#d73a49]' },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">ব্যবহারকারী ব্যবস্থাপনা</h1>
          <p className="text-sm text-[#8b949e]">মোট {total.toLocaleString('bn-BD')} জন ব্যবহারকারী</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58]" />
            <input
              type="text"
              className="form-input pl-9 py-2.5 text-sm w-60"
              placeholder="নাম, ফোন বা ইমেইল..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-2.5 px-4 text-sm">খুঁজুন</button>
        </form>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#0d1117]/50">
                {['নাম', 'ফোন', 'ইমেইল', 'স্ট্যাটাস', 'অর্ডার', 'অ্যাক্সেস', 'নিবন্ধন', 'অ্যাকশন'].map((h) => (
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
                        <td key={j} className="px-4 py-4"><div className="h-4 shimmer rounded" /></td>
                      ))}
                    </tr>
                  ))
                : users.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-[#484f58]">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      কোনো ব্যবহারকারী পাওয়া যায়নি
                    </td>
                  </tr>
                )
                : users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#ff7a45]/20 flex items-center justify-center text-[#ff7a45] text-xs font-bold flex-shrink-0">
                          {user.name?.[0] || 'U'}
                        </div>
                        <div>
                          <span className="text-[#e6edf3] text-xs font-medium block">{user.name || 'নামবিহীন'}</span>
                          <span className="text-[10px] text-[#ff7a45] font-mono select-all">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-[#8b949e]">{user.mobileNumber || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-[#8b949e]">{user.email}</td>
                    <td className="px-4 py-3.5">
                      {user.isBlocked ? (
                        <span className="badge badge-error">ব্লকড</span>
                      ) : (
                        <span className="badge badge-success">সক্রিয়</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-center text-[#8b949e]">
                      {user._count?.orders ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-center text-[#8b949e]">
                      {user.accessGrants && user.accessGrants.length > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          {user.accessGrants.map((g: any) => (
                            <span key={g.id} className="badge badge-accent text-[10px] max-w-[120px] truncate" title={g.contentItem?.titleBn}>
                              {g.contentItem?.titleBn}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>{user._count?.accessGrants ?? 0}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#484f58] whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDeviceUser(user)}
                          className="p-1.5 rounded-lg text-[#58a6ff] hover:bg-[#58a6ff]/15 transition-all"
                          title="ডিভাইস / ড্রাইভ ব্লক প্রসেস"
                        >
                          <Laptop className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/admin/access-requests`}
                          className="p-1.5 rounded-lg text-[#ff7a45] hover:bg-[#ff7a45]/15 transition-all"
                          title="ম্যানুয়াল কোর্স অ্যাক্সেস দিন"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </a>

                        {user.isBlocked ? (
                          <button
                            onClick={() => confirmAction(user.id, 'unblock')}
                            disabled={actionId === user.id}
                            className="p-1.5 rounded-lg text-[#3fb950] hover:bg-[#3fb950]/15 transition-all disabled:opacity-40"
                            title="ব্লক তুলুন"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmAction(user.id, 'block')}
                            disabled={actionId === user.id}
                            className="p-1.5 rounded-lg text-[#f85149] hover:bg-[#f85149]/15 transition-all disabled:opacity-40"
                            title="ব্লক করুন"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmAction(user.id, 'logout')}
                          disabled={actionId === user.id}
                          className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
                          title="ফোর্স লগআউট"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirmAction(user.id, 'delete')}
                          disabled={actionId === user.id}
                          className="p-1.5 rounded-lg text-[#f85149] hover:bg-[#f85149]/20 transition-all disabled:opacity-40"
                          title="অ্যাকাউন্ট ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          title={confirmMeta[confirm.action].title}
          desc={confirmMeta[confirm.action].desc}
          confirmLabel={confirmMeta[confirm.action].label}
          confirmClass={confirmMeta[confirm.action].cls}
          onConfirm={() => executeAction(confirm.id, confirm.action)}
          onClose={() => setConfirm(null)}
        />
      )}

      {selectedDeviceUser && (
        <DevicesModal
          user={selectedDeviceUser}
          onClose={() => setSelectedDeviceUser(null)}
        />
      )}
    </div>
  );
}
