'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('ui');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label || t('copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('copyFailed'));
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="sm"
      className={className}
      aria-label={label || t('copy')}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          {t('copied')}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {t('copy')}
        </>
      )}
    </Button>
  );
}
