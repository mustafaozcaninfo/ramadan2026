'use client';

import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function AzanButton() {
  const t = useTranslations('common');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/azan.mp3');
    audio.loop = false;
    audio.preload = 'auto';
    
    // Error handling
    audio.addEventListener('error', () => {
      setError('Failed to load audio');
      setIsLoading(false);
      toast.error(t('azan') + ' - ' + (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Ses yüklenemedi' : 'Audio failed to load'));
    });

    audio.addEventListener('loadstart', () => {
      setIsLoading(true);
      setError(null);
    });

    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [t]);

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            audioRef.current!.onended = () => {
              setIsPlaying(false);
            };
          })
          .catch((err) => {
            setError('Failed to play audio');
            setIsPlaying(false);
            toast.error(t('azan') + ' - ' + (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Çalınamadı' : 'Failed to play'));
          });
      }
    }
  };

  const ariaLabel = isPlaying 
    ? (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Ezan çalıyor, durdurmak için tıklayın' : 'Azan is playing, click to stop')
    : (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Ezan çalmak için tıklayın' : 'Click to play Azan');

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
          {typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Yükleniyor...' : 'Loading...'}
        </>
      ) : isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 mr-2" />
          {t('azan')} ({typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Durdur' : 'Stop'})
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
