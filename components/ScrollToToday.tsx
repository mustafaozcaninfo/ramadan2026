'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScrollToTodayProps {
  className?: string;
  /** Gregoryen bugün (YYYY-MM-DD); listede yoksa null. */
  todayIso: string | null;
}

export function ScrollToToday({ className, todayIso }: ScrollToTodayProps) {
  const t = useTranslations('calendar');

  const scrollToToday = () => {
    if (todayIso === null) return;

    const todayCardId = `day-${todayIso}`;
    const todayCard = document.getElementById(todayCardId);

    if (todayCard) {
      todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const cardDiv = todayCard.querySelector('div') as HTMLElement | null;
      if (cardDiv) {
        cardDiv.classList.add('ring-2', 'ring-brand-green', 'ring-opacity-75', 'transition-all');
        setTimeout(() => {
          cardDiv.classList.remove('ring-2', 'ring-brand-green', 'ring-opacity-75');
        }, 2000);
      }

      setTimeout(() => {
        const cardButton = todayCard.querySelector('button[aria-expanded]') as HTMLButtonElement | null;
        if (cardButton && cardButton.getAttribute('aria-expanded') === 'false') {
          cardButton.click();
        }
      }, 300);
    }
  };

  return (
    <Button
      onClick={scrollToToday}
      variant="outline"
      size="sm"
      className={className}
      disabled={todayIso === null}
      aria-label={t('scrollToToday')}
    >
      <Calendar className="w-4 h-4 mr-2" />
      {t('scrollToToday')}
    </Button>
  );
}
