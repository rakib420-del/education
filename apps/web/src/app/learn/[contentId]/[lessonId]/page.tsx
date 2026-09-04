'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play, CheckCircle, Lock, ChevronLeft, ChevronRight,
  Menu, X, ShieldAlert, GraduationCap, Clock, Volume2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursePlayerPage() {
  const { contentId, lessonId } = useParams<{ contentId: string; lessonId: string }>();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Watermark position state for anti-piracy floating effect
  const [wmPosition, setWmPosition] = useState({ top: '20%', left: '30%' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=/learn/${contentId}/${lessonId}`);
    }
  }, [isAuthenticated, isLoading, contentId, lessonId, router]);

  const [resumeAt, setResumeAt] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedSecRef = useRef<number>(0);

  // ── Load course details & lessons ─────────────────────
  useEffect(() => {
    if (!contentId) return;
    api.getContentBySlug(contentId)
      .then(({ data }) => {
        setCourse(data);
        if (lessonId) {
          const l = data.lessons?.find((item: any) => item.id === lessonId);
          if (l) setCurrentLesson(l);
        }
      })
      .catch(() => { });
  }, [contentId, lessonId]);

  // ── Fetch signed video stream URL & watermark ──────────
  useEffect(() => {
    if (!contentId || !lessonId) return;
    setLoading(true);
    api.getSignedStreamUrl(contentId, lessonId)
      .then(({ data }) => {
        // API returns { hlsUrl, watermarkData: { name, phone } }
        setStreamUrl(data.hlsUrl);
        setWatermarkText(data.watermarkData?.phone || (user as any)?.mobileNumber || user?.email || '');
      })
      .catch((err) => {
        console.error('Failed to load video stream', err);
      })
      .finally(() => setLoading(false));
  }, [contentId, lessonId, user]);

  // ── Load resume position from progress API ─────────────
  useEffect(() => {
    if (!lessonId || !isAuthenticated) return;
    // GET /users/me/progress/:lessonId — fetch saved position
    import('@/lib/api-client').then(({ apiClient }) =>
      apiClient.get(`/users/me/progress/${lessonId}`)
        .then(({ data }) => {
          if (data?.watchedSeconds && data.watchedSeconds > 5) {
            setResumeAt(data.watchedSeconds);
          }
        })
        .catch(() => { }) // silently ignore if no record
    );
  }, [lessonId, isAuthenticated]);

  // ── Attach video event listeners for progress save ─────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lessonId || !isAuthenticated) return;

    // Seek to resume position once metadata is loaded
    const handleMetadata = () => {
      if (resumeAt > 0 && video.duration > resumeAt + 5) {
        video.currentTime = resumeAt;
      }
    };

    // Save progress every 30s during playback
    const handleTimeUpdate = () => {
      const current = Math.floor(video.currentTime);
      if (current - lastSavedSecRef.current >= 30) {
        lastSavedSecRef.current = current;
        api.updateProgress(lessonId, current).catch(() => { });
      }
    };

    // Save progress on video end (triggers 90% completion check in API)
    const handleEnded = () => {
      api.updateProgress(lessonId, Math.floor(video.duration || 0)).catch(() => { });
    };

    // Save on pause too (covers closing browser mid-lesson)
    const handlePause = () => {
      const current = Math.floor(video.currentTime);
      if (current > lastSavedSecRef.current) {
        lastSavedSecRef.current = current;
        api.updateProgress(lessonId, current).catch(() => { });
      }
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
    };
  }, [lessonId, isAuthenticated, resumeAt]);

  // Anti-piracy: Keyboard listener to block PrintScreen, Snipping tool shortcuts (Win+Shift+S), Ctrl+P, F12
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

  // Periodically move watermark around video screen to prevent screen recordings
  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 70 + 10) + '%';
      const left = Math.floor(Math.random() * 60 + 10) + '%';
      setWmPosition({ top, left });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const lessons = course.lessons || [];
  const currentIndex = lessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#090d13] flex flex-col text-[#e6edf3]">
      {/* Top player header */}
      <header className="h-14 border-b border-[#30363d] bg-[#0d1117] px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.slug}`}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-[1px] bg-[#30363d]" />
          <h1 className="text-sm font-semibold truncate max-w-md">
            {course.titleBn}
          </h1>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg border border-[#30363d] text-sm text-[#8b949e] hover:text-white flex items-center gap-2"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="hidden sm:inline">সূচিপত্র</span>
        </button>
      </header>

      {/* Main player layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Video stream container */}
        <div className="flex-1 bg-black flex flex-col justify-center relative min-h-[300px] lg:min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8">
              <div className="w-8 h-8 border-2 border-[#ff7a45] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#8b949e]">সুরক্ষিত স্ট্রীম লোড হচ্ছে...</p>
            </div>
          ) : streamUrl ? (
            <div className="relative w-full h-full aspect-video max-h-[75vh] mx-auto bg-black overflow-hidden group">
              {streamUrl.includes('iframe') || streamUrl.includes('embed') || streamUrl.includes('mediadelivery.net') ? (
                <iframe
                  key={streamUrl}
                  src={streamUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : (
                <video
                  key={streamUrl}
                  ref={videoRef}
                  src={streamUrl}
                  controls
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                />
              )}

              {/* Dynamic Watermark Overlay (Anti-piracy) */}
              <div
                className="absolute pointer-events-none select-none text-[11px] font-mono text-white/25 bg-black/40 px-2.5 py-1 rounded backdrop-blur-[2px] transition-all duration-1000 z-20 border border-white/5"
                style={{ top: wmPosition.top, left: wmPosition.left }}
              >
                {watermarkText || `${(user as any)?.mobileNumber || user?.email} | ${user?.id?.slice(0, 8)}`}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ShieldAlert className="w-12 h-12 text-[#f85149] mb-3" />
              <h3 className="text-base font-bold text-white mb-1">ভিডিও চালুর অনুমতি নেই</h3>
              <p className="text-xs text-[#8b949e] max-w-sm mb-4">
                এই পাঠটি দেখার জন্য আপনাকে অবশ্যই কোর্সটি এনরোল করতে হবে অথবা আপনার সক্রিয় সেশন যাচাই করতে হবে।
              </p>
              <Link href={`/checkout/${course.id}`} className="btn-primary text-xs px-5 py-2">
                কোর্সে ভর্তি হোন
              </Link>
            </div>
          )}

          {/* Bottom navigation within player */}
          <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8b949e]">বর্তমান পাঠ ({currentIndex + 1}/{lessons.length})</p>
              <h2 className="text-base font-bold text-white truncate max-w-md">
                {currentLesson?.titleBn || 'পাঠ নির্বাচন করুন'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {prevLesson && (
                <Link
                  href={`/learn/${contentId}/${prevLesson.id}`}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> আগের পাঠ
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/learn/${contentId}/${nextLesson.id}`}
                  className="btn-primary py-2 px-3 text-xs flex items-center gap-1"
                >
                  পরের পাঠ <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar lesson playlist */}
        {sidebarOpen && (
          <aside className="w-full lg:w-80 bg-[#0d1117] border-l border-[#30363d] flex flex-col h-[400px] lg:h-auto overflow-y-auto">
            <div className="p-4 border-b border-[#30363d]">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#ff7a45]" />
                কোর্সের পাঠ তালিকা ({lessons.length})
              </h3>
            </div>

            <div className="flex-1 divide-y divide-[#30363d]/50">
              {lessons.map((lesson: any, i: number) => {
                const isActive = lesson.id === lessonId;
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${contentId}/${lesson.id}`}
                    className={`flex items-start gap-3 p-3.5 text-xs transition-colors ${isActive ? 'bg-[#ff7a45]/15 border-l-2 border-l-[#ff7a45]' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-black/40 text-[#8b949e]">
                      {isActive ? (
                        <Play className="w-3 h-3 text-[#ff7a45] fill-[#ff7a45]" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium line-clamp-2 ${isActive ? 'text-[#ff7a45]' : 'text-[#c8d1da]'}`}>
                        {lesson.titleBn}
                      </p>
                      {lesson.durationSeconds && (
                        <span className="text-[10px] text-[#484f58] flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(lesson.durationSeconds / 60)} মিনিট
                        </span>
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
