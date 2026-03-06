'use client';

import { useEffect, useState } from 'react';
import { CalendarDayCard } from '@/components/CalendarDayCard';
import { ExpandCollapseToggle } from '@/components/ExpandCollapseToggle';
import type { AladhanResponse } from '@/lib/prayer';

interface CalendarPageClientProps {
  prayerTimes: AladhanResponse[];
  startDate: Date;
  locale: 'tr' | 'en';
  autoScrollToToday?: boolean;
}

export function CalendarPageClient({
  prayerTimes,
  startDate,
  locale,
  autoScrollToToday,
}: CalendarPageClientProps) {
  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({});
  const allExpanded = Object.values(expandedStates).every(Boolean) && Object.keys(expandedStates).length === prayerTimes.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedStates({});
    } else {
      const newStates: Record<number, boolean> = {};
      prayerTimes.forEach((_, index) => {
        newStates[index + 1] = true;
      });
      setExpandedStates(newStates);
    }
  };

  const toggleCard = (dayNumber: number) => {
    setExpandedStates(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }));
  };

  // When navigated with ?today=1, automatically scroll to today's card on mount
  useEffect(() => {
    if (!autoScrollToToday) return;

    const ramadanStartDate = new Date(startDate);
    ramadanStartDate.setHours(0, 0, 0, 0);
    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    const diffTime = todayMidnight.getTime() - ramadanStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const todayDayNumber = diffDays + 1;

    if (todayDayNumber < 1 || todayDayNumber > prayerTimes.length) {
      return;
    }

    const todayCardId = `day-${todayDayNumber}`;
    const todayCard = document.getElementById(todayCardId);

    if (todayCard) {
      todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const cardDiv = todayCard.querySelector('div') as HTMLElement | null;
      if (cardDiv) {
        cardDiv.classList.add('ring-2', 'ring-ramadan-green', 'ring-opacity-75', 'transition-all');
        setTimeout(() => {
          cardDiv.classList.remove('ring-2', 'ring-ramadan-green', 'ring-opacity-75');
        }, 2000);
      }
    }
  }, [autoScrollToToday, startDate, prayerTimes.length]);

  return (
    <>
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2">
          {prayerTimes.length > 0 && <ExpandCollapseToggle allExpanded={allExpanded} onToggle={toggleAll} />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {prayerTimes.map((day, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          const dayNumber = index + 1;
          const dayId = `day-${dayNumber}`;
          return (
            <div key={day.data.date.readable} id={dayId}>
              <CalendarDayCard
                day={day}
                dayNumber={dayNumber}
                locale={locale}
                date={date}
                expanded={expandedStates[dayNumber]}
                onToggle={() => toggleCard(dayNumber)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
