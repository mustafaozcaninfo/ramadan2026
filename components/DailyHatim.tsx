'use client';

import { BookOpen } from 'lucide-react';

export interface DailyHatimProps {
  ramadanDay: number | null;
  locale: 'tr' | 'en' | 'ar';
}

export function DailyHatim({ ramadanDay, locale }: DailyHatimProps) {
  if (ramadanDay === null || ramadanDay < 1 || ramadanDay > 30) return null;

  const juz = ramadanDay;
  const label =
    locale === 'tr'
      ? `Bugünkü hatim: Cüz ${juz}`
      : locale === 'ar'
        ? `حزب اليوم: الجزء ${juz}`
        : `Today’s reading: Juz ${juz}`;

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
          {locale === 'tr' ? 'Günlük hatim' : locale === 'ar' ? 'حزب اليوم' : 'Daily reading'}
        </p>
        <p className="font-semibold text-slate-100">
          {locale === 'tr' ? `Cüz ${juz}` : locale === 'ar' ? `الجزء ${juz}` : `Juz ${juz}`}
        </p>
      </div>
    </div>
  );
}
