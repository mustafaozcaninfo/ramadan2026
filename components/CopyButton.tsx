'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(label || 'Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="ghost"
      size="sm"
      className={className}
      aria-label={label || 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          {typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Kopyalandı' : 'Copied'}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Kopyala' : 'Copy'}
        </>
      )}
    </Button>
  );
}
