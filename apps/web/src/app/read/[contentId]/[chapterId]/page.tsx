'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, ChevronRight, Menu, X,
  ShieldAlert, ZoomIn, ZoomOut, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function BookReaderPage() {
  const { contentId, chapterId } = useParams<{ contentId: string; chapterId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [book, setBook] = useState<any>(null);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100); // percent

  // Floating watermark position
  const [wmPosition, setWmPosition] = useState({ top: '30%', left: '40%' });

  // ── Auth guard ────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=/read/${contentId}/${chapterId}`);
    }
  }, [isAuthenticated, isLoading, contentId, chapterId, router]);

  // ── Fetch book metadata ───────────────────────────────
  useEffect(() => {
    if (!contentId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/content/${contentId}`)
      .then((r) => r.json())
      .then((data) => {
        setBook(data);
        if (chapterId) {
          const ch = data.chapters?.find((item: any) => item.id === chapterId);
          if (ch) setCurrentChapter(ch);
        }
      })
      .catch(() => { });
  }, [contentId, chapterId]);

  // ── Fetch chapter page images ─────────────────────────
  useEffect(() => {
    if (!chapterId || !isAuthenticated) return;
    setLoading(true);
    setAccessDenied(false);
    api.getChapterPages(chapterId)
      .then(({ data }) => {
        // API: { pages: string[], watermarkData: { name, phone } }
        setPages(data.pages || []);
        setWatermarkText(
          data.watermarkData?.phone || (user as any)?.mobileNumber || user?.email || ''
        );
      })
      .catch((err) => {
        if (err?.response?.status === 403) setAccessDenied(true);
      })
      .finally(() => setLoading(false));
  }, [chapterId, isAuthenticated, user]);

  // Anti-piracy: Keyboard listener & Focus protection to block PrintScreen, Snipping Tool (Win+Shift+S), Ctrl+P, F12
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen & Alt+PrintScreen
      if (e.key === 'PrintScreen' || (e.altKey && e.key === 'PrintScreen')) {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (_) {}
      }
      // Block Win+Shift+S (Windows Snipping Tool), Ctrl+P, Ctrl+S, Ctrl+Shift+I, F12
      if (
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 's' || e.key === 'S')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch (_) {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ── Drift watermark every 4s ─────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setWmPosition({
        top: Math.floor(Math.random() * 70 + 10) + '%',
        left: Math.floor(Math.random() * 60 + 10) + '%',
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chapters = book.chapters || [];
  const currentIndex = chapters.findIndex((c: any) => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div
      className="min-h-screen bg-[#090d13] flex flex-col text-[#e6edf3] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── Top header ────────────────────────────────── */}
      <header className="h-14 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/books/${book.slug}`}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-[1px] bg-[#30363d]" />
          <h1 className="text-sm font-semibold truncate max-w-xs sm:max-w-md">{book.titleBn}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            <button
              onClick={() => setZoom((z) => Math.max(z - 10, 60))}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
              title="ছোট করুন"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#484f58] w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 10, 150))}
              className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/10 transition-all"
              title="বড় করুন"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-[#30363d] text-sm text-[#8b949e] hover:text-white flex items-center gap-2"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline">সূচিপত্র</span>
          </button>
        </div>
      </header>

      {/* ── Main layout ───────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* ── Page viewer ───────────────────────────── */}
        <div className="flex-1 flex flex-col bg-[#111518] overflow-y-auto relative">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12">
              <Loader2 className="w-8 h-8 text-[#ff7a45] animate-spin" />
              <p className="text-xs text-[#8b949e]">সুরক্ষিত পৃষ্ঠা লোড হচ্ছে...</p>
            </div>
          ) : accessDenied ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-[#f85149] mb-3" />
              <h3 className="text-base font-bold text-white mb-1">প্রবেশাধিকার নেই</h3>
              <p className="text-xs text-[#8b949e] max-w-sm mb-4">
                এই অধ্যায়টি পড়তে বইটির ডিজিটাল কপি কিনতে হবে।
              </p>
              <Link href={`/checkout/${contentId}`} className="btn-primary text-xs px-5 py-2">
                বইটি কিনুন
              </Link>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <BookOpen className="w-10 h-10 text-[#484f58] mb-3" />
              <p className="text-sm text-[#484f58]">কোনো পৃষ্ঠা পাওয়া যায়নি</p>
            </div>
          ) : (
            // Render PDF viewer or page images
            <div className="relative w-full flex-1 flex flex-col items-center">

              {pages[0]?.endsWith('.pdf') || pages[0]?.includes('pdf') || pages[0]?.startsWith('http') ? (
                <div className="w-full h-full min-h-[85vh] overflow-hidden relative bg-[#111518]">
                  <iframe
                    key={pages[0]}
                    src={`${pages[0].includes('#') ? pages[0] : pages[0] + '#toolbar=0&navpanes=0&scrollbar=0'}`}
                    className="w-full absolute -top-[56px] left-0 h-[calc(100%+56px)] border-0 pointer-events-auto select-none"
                    title="PDF Reader"
                  />
                </div>
              ) : (
                <div className="py-6 px-4 flex flex-col items-center gap-4 w-full">
                  {pages.map((pageUrl, i) => (
                    <div
                      key={i}
                      className="relative bg-white shadow-2xl rounded overflow-hidden"
                      style={{ width: `${zoom}%`, maxWidth: '900px' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pageUrl}
                        alt={`পৃষ্ঠা ${i + 1}`}
                        className="w-full block pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Chapter nav bar ──────────────────────── */}
          <div className="sticky bottom-0 p-3 bg-[#0d1117]/95 backdrop-blur border-t border-[#30363d] flex items-center justify-between z-10 flex-shrink-0">
            <div className="min-w-0">
              <p className="text-xs text-[#484f58]">অধ্যায় {currentIndex + 1} / {chapters.length}</p>
              <h2 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {currentChapter?.titleBn || 'অধ্যায় নির্বাচন করুন'}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {prevChapter && (
                <Link
                  href={`/read/${contentId}/${prevChapter.id}`}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> আগের
                </Link>
              )}
              {nextChapter && (
                <Link
                  href={`/read/${contentId}/${nextChapter.id}`}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                >
                  পরের <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Chapters TOC sidebar ─────────────────── */}
        {sidebarOpen && (
          <aside className="w-full lg:w-72 bg-[#0d1117] border-l border-[#30363d] flex flex-col h-[280px] lg:h-auto overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-[#30363d] flex-shrink-0">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#ff7a45]" />
                সূচিপত্র ({chapters.length} অধ্যায়)
              </h3>
            </div>
            <div className="flex-1 divide-y divide-[#30363d]/50">
              {chapters.map((ch: any, i: number) => {
                const isActive = ch.id === chapterId;
                return (
                  <Link
                    key={ch.id}
                    href={`/read/${contentId}/${ch.id}`}
                    className={`flex items-start gap-3 p-3.5 text-xs transition-colors ${isActive
                        ? 'bg-[#ff7a45]/12 border-l-2 border-l-[#ff7a45]'
                        : 'hover:bg-white/5 border-l-2 border-l-transparent'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${isActive ? 'bg-[#ff7a45] text-white' : 'bg-black/40 text-[#8b949e]'
                      }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium line-clamp-2 leading-snug ${isActive ? 'text-[#ff7a45]' : 'text-[#c8d1da]'}`}>
                        {ch.titleBn}
                      </p>
                      {ch.pageCount && (
                        <span className="text-[10px] text-[#484f58] block mt-0.5">{ch.pageCount} পৃষ্ঠা</span>
                      )}
                      {ch.isPreview && (
                        <span className="text-[10px] text-[#3fb950] mt-0.5 block">বিনামূল্যে পূর্বরূপ</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
