'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { tr, enUS, arSA } from 'date-fns/locale';
import {
  Moon,
  Sun,
  ChevronDown,
  Clock,
  Sunrise as SunriseIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gregorianDdMmYyyyToIso } from '@/lib/gregorianIso';
import type { AladhanResponse } from '@/lib/prayer';

const PRAYER_KEYS = [
  { key: 'Fajr' as const, labelKey: 'fajr', icon: Moon, color: 'blue' },
  { key: 'Sunrise' as const, labelKey: 'sunrise', icon: SunriseIcon, color: 'amber' },
  { key: 'Dhuhr' as const, labelKey: 'dhuhr', icon: Sun, color: 'yellow' },
  { key: 'Asr' as const, labelKey: 'asr', icon: Clock, color: 'orange' },
  { key: 'Maghrib' as const, labelKey: 'maghrib', icon: Sun, color: 'brand-gold' },
  { key: 'Isha' as const, labelKey: 'isha', icon: Moon, color: 'purple' },
] as const;

const colorClasses: Record<string, { border: string; text: string; bg: string }> = {
  blue: {
    border: 'border-blue-500/60',
    text: 'text-blue-200',
    bg: 'bg-blue-500/10',
  },
  amber: {
    border: 'border-amber-500/60',
    text: 'text-amber-200',
    bg: 'bg-amber-500/10',
  },
  yellow: {
    border: 'border-yellow-500/60',
    text: 'text-yellow-200',
    bg: 'bg-yellow-500/10',
  },
  orange: {
    border: 'border-orange-500/60',
    text: 'text-orange-200',
    bg: 'bg-orange-500/10',
  },
  'brand-gold': {
    border: 'border-brand-gold/60',
    text: 'text-brand-gold',
    bg: 'bg-brand-gold/10',
  },
  purple: {
    border: 'border-purple-500/60',
    text: 'text-purple-200',
    bg: 'bg-purple-500/10',
  },
};

interface CalendarDayCardProps {
  day: AladhanResponse;
  dayOfMonth: number;
  locale: 'tr' | 'en' | 'ar';
  date: Date;
  cityTodayIso: string;
  expanded?: boolean;
  onToggle?: () => void;
}

export function CalendarDayCard({
  day,
  dayOfMonth,
  locale,
  date,
  cityTodayIso,
  expanded: controlledExpanded,
  onToggle,
}: CalendarDayCardProps) {
  const t = useTranslations('calendar');
  const tCommon = useTranslations('common');
  const [internalExpanded, setInternalExpanded] = useState(false);
  const dateLocale = locale === 'tr' ? tr : locale === 'ar' ? arSA : enUS;
  const cardIso = gregorianDdMmYyyyToIso(day.data.date.gregorian.date);
  const isTodayDate = cardIso !== null && cardIso === cityTodayIso;
  const timings = day.data.timings;

  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setExpanded = onToggle || (() => setInternalExpanded((prev) => !prev));

  return (
    <div
      className={`relative overflow-hidden backdrop-blur-sm transition-all duration-300 rounded-xl ${
        isTodayDate
          ? 'bg-gradient-to-br from-brand-green/40 via-slate-700/95 to-slate-800/95 border-2 border-brand-green shadow-xl shadow-brand-green/40'
          : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 border border-slate-600/60 hover:border-slate-500 hover:shadow-lg hover:scale-[1.02]'
      }`}
    >
      {isTodayDate && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-green/15 via-transparent to-qatar-maroon/15 pointer-events-none" />
      )}

      <button
        type="button"
        onClick={setExpanded}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 rounded-lg active:scale-[0.98] transition-transform"
        aria-expanded={expanded}
        aria-controls={`day-${dayOfMonth}-content`}
        aria-label={expanded ? t('collapse') : t('expand')}
      >
        <div className="p-4 sm:p-5 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <p
                className={`text-base sm:text-lg font-bold ${isTodayDate ? 'text-brand-green' : 'text-slate-100'}`}
              >
                {format(date, 'd MMMM', { locale: dateLocale })}
              </p>
              {isTodayDate && (
                <span className="inline-flex items-center rounded-full border-2 border-emerald-500 bg-emerald-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow-md dark:bg-emerald-700 dark:border-emerald-400">
                  {tCommon('today')}
                </span>
              )}
            </div>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                expanded
                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                  : 'bg-slate-600/50 border-slate-500 text-slate-300'
              }`}
              aria-hidden
            >
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 mt-2 space-y-0.5">
            <p className="font-medium">{format(date, 'EEEE, d MMMM yyyy', { locale: dateLocale })}</p>
            {day.data.date.hijri?.day && day.data.date.hijri?.month?.en && (
              <p className="text-brand-gold font-semibold">
                {day.data.date.hijri.day} {day.data.date.hijri.month.en} {day.data.date.hijri.year} AH
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3">
            {PRAYER_KEYS.map(({ key, labelKey, icon: Icon, color }) => {
              const styles = colorClasses[color] ?? colorClasses.blue;
              return (
                <div
                  key={key}
                  className={`flex flex-col gap-0.5 rounded-lg ${styles.bg} px-2 py-1.5 border ${styles.border}`}
                >
                  <div className="flex items-center gap-1">
                    <Icon className={`w-3 h-3 shrink-0 ${styles.text}`} aria-hidden />
                    <p className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">{t(labelKey)}</p>
                  </div>
                  <p className={`font-bold tabular-nums text-xs sm:text-sm ${styles.text} truncate`}>
                    {timings[key]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: 'auto', opacity: 1 },
              collapsed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
            id={`day-${dayOfMonth}-content`}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 relative z-10 pt-0 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-green" aria-hidden />
                  {t('allPrayerTimes')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {PRAYER_KEYS.map(({ key, labelKey, icon: Icon, color }, index) => {
                    const styles = colorClasses[color] ?? colorClasses.blue;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className={`rounded-lg p-2.5 border ${styles.border} ${styles.bg} transition-colors hover:scale-105`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon className={`w-3.5 h-3.5 ${styles.text}`} aria-hidden />
                          <p className="text-xs font-medium text-slate-400">{t(labelKey)}</p>
                        </div>
                        <p className={`font-bold tabular-nums text-sm ${styles.text}`}>{timings[key]}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
