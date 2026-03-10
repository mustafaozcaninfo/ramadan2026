'use client';

import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

export function AzanButton() {
  const t = useTranslations('common');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current !== null) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/azan.mp3');
    audio.loop = false;
    audio.preload = 'metadata';

    const handleError = () => {
      setError(t('azanLoadError'));
      setIsLoading(false);
      clearLoadingTimeout();
      toast.error(`${t('azan')} - ${t('azanLoadError')}`);
    };

    const handleReady = () => {
      setError(null);
      setIsLoading(false);
      clearLoadingTimeout();
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    // Ready events are inconsistent between browsers; listen to a few.
    audio.addEventListener('canplay', handleReady);
    audio.addEventListener('canplaythrough', handleReady);
    audio.addEventListener('loadeddata', handleReady);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;
    audio.load();

    return () => {
      clearLoadingTimeout();
      audio.removeEventListener('canplay', handleReady);
      audio.removeEventListener('canplaythrough', handleReady);
      audio.removeEventListener('loadeddata', handleReady);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [t]);

  const handlePlay = () => {
    if (!audioRef.current) return;
    trackEvent('azan_click');

    if (isPlaying) {
      clearLoadingTimeout();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setError(null);
      setIsLoading(true);

      clearLoadingTimeout();
      loadingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, 8000);

      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            clearLoadingTimeout();
          })
          .catch(() => {
            setError(t('azanPlayError'));
            setIsPlaying(false);
            setIsLoading(false);
            clearLoadingTimeout();
            toast.error(`${t('azan')} - ${t('azanPlayError')}`);
          });
      }
    }
  };

  const ariaLabel = isPlaying 
    ? t('azanClickToStop')
    : t('azanClickToPlay');

  return (
    <Button
      onClick={handlePlay}
      variant="outline"
      className="w-full"
      aria-label={ariaLabel}
      aria-pressed={isPlaying}
      disabled={isLoading || !!error}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('loading')}
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 mr-2" />
          {t('azan')} ({t('stop')})
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 mr-2" />
          {t('azan')}
        </>
      )}
    </Button>
  );
}
