'use client';

import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function AzanButton() {
  const t = useTranslations('common');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/azan.mp3');
    audio.loop = false;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    }
  };

  return (
    <Button
      onClick={handlePlay}
      variant="outline"
      className="w-full"
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4 mr-2" />
          {t('azan')} (Stop)
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
