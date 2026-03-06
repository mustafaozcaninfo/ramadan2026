'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const INTERVAL_OPTIONS = [15, 10, 5, 0] as const;

export function ReminderIntervalsSelector() {
  const t = useTranslations('settings');
  const reminderIntervals = useAppStore((s) => s.reminderIntervals);
  const toggleReminderInterval = useAppStore((s) => s.toggleReminderInterval);

  return (
    <div className="flex flex-wrap gap-3" role="group" aria-labelledby="reminder-intervals-label">
      <span id="reminder-intervals-label" className="sr-only">
        {t('reminderIntervalsDescription')}
      </span>
      {INTERVAL_OPTIONS.map((minutes) => {
        const checked = reminderIntervals.includes(minutes);
        const label = minutes === 0 ? t('atPrayerTime') : t('minutesBefore', { count: minutes });
        return (
          <label
            key={minutes}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
              checked
                ? 'border-ramadan-green/60 bg-ramadan-green/15 text-slate-100'
                : 'border-slate-500/50 bg-slate-800/50 text-slate-400 hover:border-slate-400'
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleReminderInterval(minutes)}
              className="h-4 w-4 rounded border border-slate-500 bg-slate-800 text-ramadan-green focus:ring-ramadan-green/50"
              aria-label={label}
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}
