'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock3, Sunrise as SunriseIcon, Sun, Moon } from 'lucide-react';
import { Countdown } from './Countdown';
import { motion, useReducedMotion } from 'framer-motion';
import { prayerInstantInZone, normalizeAladhanTime } from '@/lib/prayerTimeInZone';

type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

interface PrayerTimeCardProps {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextFajr: string;
  currentDateIso: string;
  nextDateIso: string;
  timezone: string;
  hijriDate: string;
  gregorianDate: string;
  locale: 'tr' | 'en' | 'ar';
}

const ROW_META: {
  key: PrayerKey;
  icon: typeof Moon;
  labelTr: string;
  labelEn: string;
  labelAr: string;
  color: string;
}[] = [
  { key: 'Fajr', icon: Moon, labelTr: 'İmsak', labelEn: 'Fajr', labelAr: 'الفجر', color: 'blue' },
  {
    key: 'Sunrise',
    icon: SunriseIcon,
    labelTr: 'Güneş',
    labelEn: 'Sunrise',
    labelAr: 'الشروق',
    color: 'amber',
  },
  { key: 'Dhuhr', icon: Sun, labelTr: 'Öğle', labelEn: 'Dhuhr', labelAr: 'الظهر', color: 'yellow' },
  { key: 'Asr', icon: Sun, labelTr: 'İkindi', labelEn: 'Asr', labelAr: 'العصر', color: 'orange' },
  {
    key: 'Maghrib',
    icon: Sun,
    labelTr: 'Akşam',
    labelEn: 'Maghrib',
    labelAr: 'المغرب',
    color: 'brand-gold',
  },
  { key: 'Isha', icon: Moon, labelTr: 'Yatsı', labelEn: 'Isha', labelAr: 'العشاء', color: 'purple' },
];

const ROW_RING: Record<string, string> = {
  blue: 'border-blue-500/55 bg-blue-500/10',
  amber: 'border-amber-500/55 bg-amber-500/10',
  yellow: 'border-yellow-500/50 bg-yellow-500/10',
  orange: 'border-orange-500/55 bg-orange-500/10',
  'brand-gold': 'border-brand-gold/55 bg-brand-gold/10',
  purple: 'border-purple-500/55 bg-purple-500/10',
};

export function PrayerTimeCard({
  fajr,
  sunrise,
  dhuhr,
  asr,
  maghrib,
  isha,
  nextFajr,
  currentDateIso,
  nextDateIso,
  timezone,
  hijriDate,
  gregorianDate,
  locale,
}: PrayerTimeCardProps) {
  const reduceMotion = useReducedMotion();
  const L = (trText: string, enText: string, arText: string) =>
    locale === 'tr' ? trText : locale === 'ar' ? arText : enText;

  const timings: Record<PrayerKey, string> = {
    Fajr: fajr,
    Sunrise: sunrise,
    Dhuhr: dhuhr,
    Asr: asr,
    Maghrib: maghrib,
    Isha: isha,
  };

  const now = new Date();

  type Slot = { key: PrayerKey; iso: string; time: string; labelTr: string; labelEn: string; labelAr: string };
  const todaySlots: Slot[] = ROW_META.map((row) => ({
    key: row.key,
    iso: currentDateIso,
    time: timings[row.key],
    labelTr: row.labelTr,
    labelEn: row.labelEn,
    labelAr: row.labelAr,
  }));
  const nextDayFajrSlot: Slot = {
    key: 'Fajr',
    iso: nextDateIso,
    time: nextFajr,
    labelTr: 'İmsak',
    labelEn: 'Fajr',
    labelAr: 'الفجر',
  };
  const allSlots = [...todaySlots, nextDayFajrSlot];

  const slotInstants = allSlots.map((s) => ({
    ...s,
    at: prayerInstantInZone(s.iso, s.time, timezone),
  }));

  const nextSlot =
    slotInstants.find((s) => s.at.getTime() > now.getTime()) ?? slotInstants[slotInstants.length - 1];

  const nextLabel =
    locale === 'tr'
      ? `Sıradaki: ${nextSlot.labelTr}`
      : locale === 'ar'
        ? `التالي: ${nextSlot.labelAr}`
        : `Next: ${nextSlot.labelEn}`;

  const countdownLabel =
    locale === 'tr'
      ? `${nextSlot.labelTr} vaktine kalan süre`
      : locale === 'ar'
        ? `الوقت المتبقي ل${nextSlot.labelAr}`
        : `Time until ${nextSlot.labelEn}`;

  return (
    <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-qatar-maroon/10 via-transparent to-brand-green/10 pointer-events-none"
        aria-hidden
      />

      <CardHeader className="relative z-10 p-4 sm:p-5 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg text-amber-100 font-bold drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
          {L('Namaz Vakitleri', 'Prayer Times', 'مواقيت الصلاة')}
        </CardTitle>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-500/50 bg-slate-900/35 px-3 py-2 text-xs sm:text-sm text-slate-100">
            <Clock3 className="w-4 h-4 text-brand-gold shrink-0" />
            <span className="min-w-0">{nextLabel}</span>
            <span className="font-bold tabular-nums text-brand-gold shrink-0">
              {normalizeAladhanTime(nextSlot.time)}
            </span>
          </div>
          <div className="inline-flex items-center rounded-lg border border-slate-500/50 bg-slate-900/35 px-3 py-2 text-[11px] sm:text-xs text-slate-200">
            {hijriDate || gregorianDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-5 sm:space-y-6 relative z-10">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="rounded-xl border border-emerald-500/35 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-sm"
        >
          <Countdown
            targetTime={normalizeAladhanTime(nextSlot.time)}
            targetDateTime={nextSlot.at}
            label={countdownLabel}
            locale={locale}
            variant="next"
          />
        </motion.div>

        <div className="space-y-2 sm:space-y-2.5">
          {ROW_META.map((row, index) => {
            const Icon = row.icon;
            const display = normalizeAladhanTime(timings[row.key]);
            const isNext =
              nextSlot.key === row.key && nextSlot.iso === currentDateIso && nextSlot.at.getTime() > now.getTime();
            const ring = ROW_RING[row.color] ?? ROW_RING.blue;
            return (
              <motion.div
                key={row.key}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.22, ease: 'easeOut' }}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 ${
                  isNext ? `ring-2 ring-emerald-400/60 ${ring}` : 'border-slate-600/55 bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isNext ? 'bg-emerald-500/25' : 'bg-slate-700/80'}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isNext ? 'text-emerald-200' : 'text-slate-300'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                      {L(row.labelTr, row.labelEn, row.labelAr)}
                    </p>
                    {isNext && (
                      <p className="text-[10px] sm:text-xs text-emerald-300/90 font-medium">
                        {L('Sıradaki vakit', 'Next prayer', 'الصلاة التالية')}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold tabular-nums text-amber-50 shrink-0">{display}</p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
