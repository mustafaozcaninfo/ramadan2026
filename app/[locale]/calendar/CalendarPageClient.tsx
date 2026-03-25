'use client';

import { useEffect, useState } from 'react';
import { CalendarDayCard } from '@/components/CalendarDayCard';
import { ExpandCollapseToggle } from '@/components/ExpandCollapseToggle';
import type { AladhanResponse } from '@/lib/prayer';

interface CalendarPageClientProps {
  prayerTimes: AladhanResponse[];
  startDate: Date;
  locale: 'tr' | 'en' | 'ar';
  autoScrollToToday?: boolean;
  cityTodayIso: string;
  todayDayInMonth: number | null;
}

export function CalendarPageClient({
  prayerTimes,
  startDate,
  locale,
  autoScrollToToday,
  cityTodayIso,
  todayDayInMonth,
}: CalendarPageClientProps) {
  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({});
  const allExpanded =
    Object.values(expandedStates).every(Boolean) &&
    Object.keys(expandedStates).length === prayerTimes.length;

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

  const toggleCard = (dayOfMonth: number) => {
    setExpandedStates((prev) => ({
      ...prev,
      [dayOfMonth]: !prev[dayOfMonth],
    }));
  };

  useEffect(() => {
    if (!autoScrollToToday || todayDayInMonth === null) return;

    const todayCardId = `day-${todayDayInMonth}`;
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
    }
  }, [autoScrollToToday, todayDayInMonth]);

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
          const dayOfMonth = index + 1;
          const dayId = `day-${dayOfMonth}`;
          return (
            <div key={day.data.date.readable} id={dayId}>
              <CalendarDayCard
                day={day}
                dayOfMonth={dayOfMonth}
                locale={locale}
                date={date}
                cityTodayIso={cityTodayIso}
                expanded={expandedStates[dayOfMonth]}
                onToggle={() => toggleCard(dayOfMonth)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
