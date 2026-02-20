'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isToday } from 'date-fns';

interface ScrollToTodayProps {
  targetId: string;
  className?: string;
  startDate?: Date;
}

export function ScrollToToday({ targetId, className, startDate }: ScrollToTodayProps) {
  const t = useTranslations('calendar');

  const scrollToToday = () => {
    // Calculate today's Ramadan day number
    const ramadanStartDate = startDate || new Date('2026-02-18');
    const today = new Date();
    
    // Reset time to midnight for accurate day calculation
    const start = new Date(ramadanStartDate);
    start.setHours(0, 0, 0, 0);
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const diffTime = todayMidnight.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Today's Ramadan day number (1-30)
    const todayDayNumber = diffDays + 1;
    
    // Check if today is within Ramadan (days 1-30)
    if (todayDayNumber < 1 || todayDayNumber > 30) {
      return; // Not during Ramadan
    }
    
    // Find today's card by ID
    const todayCardId = `day-${todayDayNumber}`;
    const todayCard = document.getElementById(todayCardId);
    
    if (todayCard) {
      // Scroll to the card
      todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add a temporary highlight effect
      const cardDiv = todayCard.querySelector('div') as HTMLElement | null;
      if (cardDiv) {
        cardDiv.classList.add('ring-2', 'ring-ramadan-green', 'ring-opacity-75', 'transition-all');
        setTimeout(() => {
          cardDiv.classList.remove('ring-2', 'ring-ramadan-green', 'ring-opacity-75');
        }, 2000);
      }
      
      // Try to expand the card if it has a button
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
      aria-label={t('scrollToToday') || 'Scroll to today'}
    >
      <Calendar className="w-4 h-4 mr-2" />
      {t('scrollToToday') || (typeof window !== 'undefined' && navigator.language.startsWith('tr') ? "Bugüne Git" : 'Go to Today')}
    </Button>
  );
}
