import type { Metadata } from 'next';
import { ExternalLink, ArrowRight, Tag } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'বিশেষ অফারসমূহ | অ্যাফিলিয়েট',
  description: 'আমাদের পার্টনার ও বিশেষ কোর্স/বইয়ের এক্সক্লুসিভ অফারসমূহ।',
};

async function getAffiliateOffers() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/affiliate`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AffiliatePage() {
  const offers = await getAffiliateOffers();

  return (
    <div className="section container-main min-h-screen py-12">
      <div className="mb-10">
        <div className="divider" />
        <h1 className="section-title flex items-center gap-3">
          <Tag className="w-8 h-8 text-[#ff7a45]" />
          বিশেষ অফার ও অ্যাফিলিয়েট
        </h1>
        <p className="section-subtitle !mb-0">
          আমাদের বিশেষ পার্টনার প্ল্যাটফর্মগুলোর সেরা কোর্স এবং অফারসমূহ এক নজরে দেখুন।
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="glass-card p-12 text-center text-[#8b949e]">
          <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#ff7a45]" />
          <p className="text-base font-semibold text-white">বর্তমানে কোনো অফার উপলব্ধ নেই</p>
          <p className="text-xs mt-1">শীঘ্রই নতুন অফার সংযুক্ত করা হবে।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer: any) => (
            <a
              key={offer.id}
              href={offer.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card group p-5 flex flex-col justify-between hover:border-[#ff7a45]/40 transition-all"
            >
              <div>
                {offer.thumbnailUrl ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-[#161b22]">
                    <img
                      src={offer.thumbnailUrl}
                      alt={offer.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-xl bg-[#21262d] flex items-center justify-center mb-4">
                    <Tag className="w-10 h-10 text-[#484f58]" />
                  </div>
                )}

                <h2 className="font-bold text-lg text-white group-hover:text-[#ff7a45] transition-colors mb-2 line-clamp-2">
                  {offer.titleBn}
                </h2>

                {offer.descriptionBn && (
                  <p className="text-sm text-[#8b949e] line-clamp-3 leading-relaxed mb-4">
                    {offer.descriptionBn}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#30363d] flex items-center justify-between">
                <span className="text-xs font-mono text-[#58a6ff] truncate max-w-[180px]">
                  {new URL(offer.externalUrl).hostname.replace('www.', '')}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#ff7a45]/15 text-[#ff7a45] group-hover:bg-[#ff7a45] group-hover:text-white transition-all">
                  অফার দেখুন <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
