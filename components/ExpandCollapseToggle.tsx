'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExpandCollapseToggleProps {
  allExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function ExpandCollapseToggle({ allExpanded, onToggle, className }: ExpandCollapseToggleProps) {
  const t = useTranslations('calendar');

  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className={className}
      aria-label={allExpanded ? t('collapseAll') : t('expandAll')}
    >
      {allExpanded ? (
        <>
          <ChevronUp className="w-4 h-4 mr-2" />
          {t('collapseAll') || (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Tümünü Kapat' : 'Collapse All')}
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4 mr-2" />
          {t('expandAll') || (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? 'Tümünü Aç' : 'Expand All')}
        </>
      )}
    </Button>
  );
}
