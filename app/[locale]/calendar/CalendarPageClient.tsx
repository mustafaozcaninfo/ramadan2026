'use client';

import { useState } from 'react';
import { CalendarDayCard } from '@/components/CalendarDayCard';
import { ExpandCollapseToggle } from '@/components/ExpandCollapseToggle';
import { ScrollToToday } from '@/components/ScrollToToday';
import type { AladhanResponse } from '@/lib/prayer';

interface CalendarPageClientProps {
  prayerTimes: AladhanResponse[];
  startDate: Date;
  locale: 'tr' | 'en';
}

export function CalendarPageClient({ prayerTimes, startDate, locale }: CalendarPageClientProps) {
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
