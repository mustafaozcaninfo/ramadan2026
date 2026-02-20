'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ScrollToTodayProps {
  targetId: string;
  className?: string;
}

export function ScrollToToday({ targetId, className }: ScrollToTodayProps) {
  const t = useTranslations('calendar');

  const scrollToToday = () => {
    // Find today's card by checking dates
    const cards = document.querySelectorAll('[id^="day-"]');
    let todayCard: HTMLElement | null = null;
    
    cards.forEach((card) => {
      const cardElement = card.querySelector('button');
      if (cardElement) {
        const dateText = cardElement.textContent || '';
        const today = new Date();
        const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        if (dateText.includes(todayStr.split(',')[0])) {
          todayCard = card as HTMLElement;
        }
      }
    });

    if (todayCard) {
      (todayCard as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight effect
      const cardDiv = (todayCard as HTMLElement).querySelector('div') as HTMLElement | null;
      if (cardDiv) {
        cardDiv.classList.add('ring-2', 'ring-ramadan-green', 'ring-opacity-75', 'transition-all');
        setTimeout(() => {
          cardDiv.classList.remove('ring-2', 'ring-ramadan-green', 'ring-opacity-75');
        }, 2000);
      }
    }
  };

  return (
    <Button
      onClick={scrollToToday}
      variant="outline"
      size="sm"
      className={className}
      aria-label={t('scrollToToday') || 'Scroll to today'}
    >
      <Calendar className="w-4 h-4 mr-2" />
      {t('scrollToToday') || (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? "Bugüne Git" : 'Go to Today')}
    </Button>
  );
}
