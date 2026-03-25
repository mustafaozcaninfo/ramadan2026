'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import { RotateCcw, PictureInPicture2, Maximize2 } from 'lucide-react';

interface LivePlayerProps {
  src: string;
  channelName: string;
  className?: string;
  locale?: 'tr' | 'en' | 'ar';
  autoPlayEnabled?: boolean;
}

export function LivePlayer({
  src,
  channelName,
  className = '',
  locale = 'tr',
  autoPlayEnabled = false,
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'buffering' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  const t = useMemo(() => ({
    tr: {
      loading: 'Yayın yükleniyor...',
      buffering: 'Tamponlanıyor...',
      error: 'Yayın yüklenemedi',
      networkError: 'Ağ hatası',
      retry: 'Tekrar Dene',
      pip: 'Küçük pencere',
      fullscreen: 'Tam ekran',
      liveLabel: 'Canlı yayın',
      broadcastLabel: `${channelName} canlı yayını`,
    },
    en: {
      loading: 'Loading stream...',
      buffering: 'Buffering...',
      error: 'Failed to load stream',
      networkError: 'Network error',
      retry: 'Retry',
      pip: 'Picture-in-picture',
      fullscreen: 'Fullscreen',
      liveLabel: 'Live stream',
      broadcastLabel: `${channelName} live broadcast`,
    },
    ar: {
      loading: 'جارٍ تحميل البث...',
      buffering: 'جارٍ التخزين المؤقت...',
      error: 'تعذر تحميل البث',
      networkError: 'خطأ في الشبكة',
      retry: 'إعادة المحاولة',
      pip: 'نافذة عائمة',
      fullscreen: 'ملء الشاشة',
      liveLabel: 'بث مباشر',
      broadcastLabel: `البث المباشر ${channelName}`,
    },
  }[locale]), [locale, channelName]);

  const attemptAutoPlay = useCallback(async (video: HTMLVideoElement) => {
    if (!autoPlayEnabled) return;
    try {
      await video.play();
      return;
    } catch {
      // Browser policy can block unmuted autoplay; retry muted.
      video.muted = true;
      try {
        await video.play();
      } catch {
        // Ignore; user can start manually via controls.
      }
    }
  }, [autoPlayEnabled]);

  const initPlayer = useCallback(
    () => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus('loading');
    setErrorMessage(null);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void attemptAutoPlay(video);
        setErrorMessage(null);
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => setStatus('playing'));

      hls.on(Hls.Events.ERROR, (_event, data: { fatal: boolean; type?: string }) => {
        if (data.fatal) {
          setStatus('error');
          setErrorMessage(
            data.type === 'networkError' ? t.networkError : t.error
          );
        }
      });

      video.addEventListener('waiting', () => setStatus('buffering'));
      video.addEventListener('playing', () => setStatus('playing'));
      video.addEventListener('canplay', () => setStatus('playing'));

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        void attemptAutoPlay(video);
        setErrorMessage(null);
      });
      video.addEventListener('waiting', () => setStatus('buffering'));
      video.addEventListener('playing', () => setStatus('playing'));
      video.addEventListener('error', () => {
        setStatus('error');
        setErrorMessage(t.error);
      });
    } else {
      setStatus('error');
      setErrorMessage(t.error);
    }
  },
    [src, t, attemptAutoPlay]
  );

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initPlayer]);

  useEffect(() => {
    if (document.pictureInPictureEnabled && videoRef.current) {
      setIsPiPSupported(true);
    }
  }, [status]);

  const handleRetry = () => {
    initPlayer();
  };

  const handlePiP = async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // PiP not available or denied
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/50 border border-slate-700/50 ${className}`}
    >
      {/* Live badge */}
      {(status === 'playing' || status === 'buffering') && (
        <div
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-red-600/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
          aria-label={t.liveLabel}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          {locale === 'tr' ? 'CANLI' : locale === 'ar' ? 'مباشر' : 'LIVE'}
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full aspect-video object-contain"
        controls
        playsInline
        muted={false}
        autoPlay={autoPlayEnabled}
        aria-label={t.broadcastLabel}
      />

      {/* Loading state */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900/95 to-black">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" />
            <span className="text-sm font-medium text-slate-300">{t.loading}</span>
          </div>
        </div>
      )}

      {/* Buffering state - subtle overlay */}
      {status === 'buffering' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      )}

      {/* Error state with retry */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-900 to-black p-6">
          <div className="rounded-full bg-red-500/20 p-4">
            <svg
              className="h-10 w-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <span className="text-center text-sm text-slate-300">{errorMessage}</span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 font-semibold text-white transition-all hover:bg-brand-green/90 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            {t.retry}
          </button>
        </div>
      )}

      {/* Controls overlay - PiP & Fullscreen */}
      {(status === 'playing' || status === 'buffering') && (
        <div className="absolute bottom-14 right-3 z-20 flex gap-2">
          {isPiPSupported && (
            <button
              onClick={handlePiP}
              className="rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
              aria-label={t.pip}
            >
              <PictureInPicture2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleFullscreen}
            className="rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label={t.fullscreen}
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
