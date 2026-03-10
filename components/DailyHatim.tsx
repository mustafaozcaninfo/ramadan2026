'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface DailyHatimProps {
  ramadanDay: number | null;
  locale: 'tr' | 'en' | 'ar';
}

export function DailyHatim({ ramadanDay, locale }: DailyHatimProps) {
  const tHome = useTranslations('home');
  if (ramadanDay === null || ramadanDay < 1 || ramadanDay > 30) return null;

  const juz = ramadanDay;
  const label = tHome('todaysReading', { juz });

  return (
    <div
      className="rounded-xl border border-ramadan-gold/40 bg-slate-800/60 px-4 py-3 flex items-center gap-3"
      role="region"
      aria-label={label}
    >
      <div className="p-2 rounded-lg bg-ramadan-gold/20">
        <BookOpen className="w-5 h-5 text-ramadan-gold" aria-hidden />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400">
          {tHome('dailyKhatm')}
        </p>
        <p className="font-semibold text-slate-100">
          {tHome('juz', { juz })}
        </p>
      </div>
    </div>
  );
}
