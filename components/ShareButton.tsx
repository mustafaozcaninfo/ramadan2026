'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const t = useTranslations('ui');

  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: url || (typeof window !== 'undefined' ? window.location.href : ''),
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${title}\n\n${text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success(t('shareTextCopied'));
      }
    } catch (err) {
      // User cancelled or error occurred
      if ((err as Error).name !== 'AbortError') {
        toast.error(t('shareFailed'));
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size="sm"
      className={className}
      aria-label={t('share')}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {t('share')}
    </Button>
  );
}
