'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
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
        toast.success(
          typeof window !== 'undefined' && navigator.language.startsWith('tr')
            ? 'Paylaşım metni kopyalandı'
            : 'Share text copied to clipboard'
        );
      }
    } catch (err) {
      // User cancelled or error occurred
      if ((err as Error).name !== 'AbortError') {
        toast.error(
          typeof window !== 'undefined' && navigator.language.startsWith('tr')
            ? 'Paylaşım başarısız'
            : 'Share failed'
        );
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="ghost"
      size="sm"
      className={className}
      aria-label={typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Paylaş' : 'Share'}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Paylaş' : 'Share'}
    </Button>
  );
}
