'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';
import { formatTimeRemaining, getTimeRemaining, parseTimeToDate, isIftarTime, isFastingTime } from '@/lib/prayer';
import { Countdown } from './Countdown';
import { motion } from 'framer-motion';

interface PrayerTimeCardProps {
  fajr: string; // Sahur
  maghrib: string; // İftar
  nextFajr: string; // Bir sonraki gün Sahur
  nextMaghrib: string; // Bir sonraki gün İftar
  sunrise: string;
  hijriDate: string;
  gregorianDate: string;
  ramadanDay: number | null; // Ramazan günü (1-30)
  locale: 'tr' | 'en';
}

export function PrayerTimeCard({
  fajr,
  maghrib,
  nextFajr,
  nextMaghrib,
  sunrise,
  hijriDate,
  gregorianDate,
  ramadanDay,
  locale,
}: PrayerTimeCardProps) {
  // Calculate current status based on today's times
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Parse prayer times
  const [fajrHour, fajrMinute] = fajr.split(':').map(Number);
  const [maghribHour, maghribMinute] = maghrib.split(':').map(Number);
  
  // Create comparison dates for today
  const todayFajrCompare = new Date();
  todayFajrCompare.setHours(fajrHour, fajrMinute, 0, 0);
  
  const todayMaghribCompare = new Date();
  todayMaghribCompare.setHours(maghribHour, maghribMinute, 0, 0);
  
  // Has today's Sahur / Iftar passed?
  const sahurHasPassedToday = now >= todayFajrCompare;
  const iftarHasPassedToday = now >= todayMaghribCompare;

  // Determine which event is next (for card ordering)
  const isSahurNext = now < todayFajrCompare || now >= todayMaghribCompare;

  // Countdown targets: if today's vakit geçtiyse, bir sonraki günün saatine göre
  const sahurTargetTime = sahurHasPassedToday ? nextFajr : fajr;
  const iftarTargetTime = iftarHasPassedToday ? nextMaghrib : maghrib;

  // Labels: belirt if it's for tomorrow
  const sahurLabel =
    locale === 'tr'
      ? sahurHasPassedToday
        ? 'Yarınki Sahura Kalan Süre'
        : 'Kalan Süre'
      : sahurHasPassedToday
        ? "Time until tomorrow's Suhoor"
        : 'Time Remaining';

  const iftarLabel =
    locale === 'tr'
      ? iftarHasPassedToday
        ? 'Yarınki İftara Kalan Süre'
        : 'Kalan Süre'
      : iftarHasPassedToday
        ? "Time until tomorrow's Iftar"
        : 'Time Remaining';

  // Check if we're past midnight (00:00 - 04:49) - this is "Sahur Öncesi"
  const isAfterMidnight = currentHour < fajrHour || (currentHour === fajrHour && currentMinute < fajrMinute);
  
  // Status logic (Doha gününe göre; gece yarısı sonrası “sonraki gün” sayılır):
  // 1. Gece yarısı – Sahur: "Sahur Öncesi"
  // 2. Sahur – İftar: "Oruçlu"
  // 3. İftar – gece yarısı: "İftar Vakti"
  const isBeforeSahur = isAfterMidnight;
  const isFasting = now >= todayFajrCompare && now < todayMaghribCompare;
  const isIftar = now >= todayMaghribCompare && !isAfterMidnight;

  const getStatusBadge = () => {
    if (isIftar) {
      return (
        <span className="inline-flex items-center rounded-full border-2 border-amber-500 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 shadow-md dark:bg-amber-500/30 dark:text-amber-100 dark:border-amber-400">
          {locale === 'tr' ? 'İftar Vakti' : 'Iftar Time'}
        </span>
      );
    }
    if (isFasting) {
      return (
        <span className="inline-flex items-center rounded-full border-2 border-emerald-500 bg-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md dark:bg-emerald-700 dark:border-emerald-400">
          {locale === 'tr' ? 'Oruçlu' : 'Fasting'}
        </span>
      );
    }
    if (isBeforeSahur) {
      return (
        <span className="inline-flex items-center rounded-full border-2 border-slate-500 bg-slate-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md dark:bg-slate-500 dark:border-slate-400">
          {locale === 'tr' ? 'Sahur Öncesi' : 'Before Suhoor'}
        </span>
      );
    }
    return null;
  };

  // Sahur card - Güneş Doğuşu sahur ile alakalı (Fajr sonrası) sağ alt köşede
  const sahurCard = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 rounded-xl p-4 sm:p-5 border border-blue-500/40 shadow-lg shadow-blue-500/20 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 relative"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg">
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-slate-100">
          {locale === 'tr' ? 'Sahur Vakti' : 'Suhoor Time'}
        </h3>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 tabular-nums drop-shadow-lg">
        {sahurHasPassedToday ? nextFajr : fajr}
      </div>
      <Countdown targetTime={sahurTargetTime} label={sahurLabel} locale={locale} variant="sahur" />
      {/* Güneş Doğuşu: mobilde countdown altında (iç içe geçmesin), desktop'ta sağ altta */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400 sm:absolute sm:bottom-4 sm:right-4 sm:mt-0">
        <Sun className="w-3.5 h-3.5 shrink-0 text-amber-400/80" aria-hidden />
        <span className="truncate">
          {locale === 'tr' ? 'Güneş Doğuşu' : 'Sunrise'}: <span className="text-slate-200 font-semibold tabular-nums">{sunrise}</span>
        </span>
      </div>
    </motion.div>
  );

  // Iftar card - Daha canlı ve kompakt
  const iftarCard = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 rounded-xl p-4 sm:p-5 border border-ramadan-gold/50 shadow-lg shadow-ramadan-gold/30 backdrop-blur-sm hover:border-ramadan-gold/70 transition-all duration-300 relative overflow-hidden"
    >
      {/* Gold glow effect - Daha belirgin */}
      <div className="absolute inset-0 bg-gradient-to-br from-ramadan-gold/10 to-transparent pointer-events-none"></div>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
        <div className="p-1.5 sm:p-2 bg-ramadan-gold/30 rounded-lg">
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-ramadan-gold" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-slate-100">
          {locale === 'tr' ? 'İftar Vakti' : 'Iftar Time'}
        </h3>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-ramadan-gold mb-2 sm:mb-3 tabular-nums drop-shadow-lg relative z-10">
        {iftarHasPassedToday ? nextMaghrib : maghrib}
      </div>
      <div className="relative z-10">
        <Countdown targetTime={iftarTargetTime} label={iftarLabel} locale={locale} variant="iftar" />
      </div>
    </motion.div>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-qatar-maroon/10 via-transparent to-ramadan-green/10 pointer-events-none" aria-hidden />

      <CardHeader className="relative z-10 pb-3 sm:pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-ramadan-green to-ramadan-gold bg-clip-text text-transparent font-bold">
              {locale === 'tr' ? 'Bugün' : 'Today'}
            </CardTitle>
            {ramadanDay !== null && (
              <span
                className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold bg-qatar-maroon/40 text-white border border-qatar-maroon/60 shadow-md"
                aria-label={locale === 'tr' ? `Ramazan ${ramadanDay}. gün` : `Ramadan day ${ramadanDay}`}
              >
                {locale === 'tr' ? `${ramadanDay}. Gün` : `Day ${ramadanDay}`}
              </span>
            )}
          </div>
          {getStatusBadge()}
        </div>
        <div className="text-xs sm:text-sm text-slate-200 mt-2 space-y-0.5">
          <p className="font-medium">{gregorianDate}</p>
          {hijriDate && <p className="text-ramadan-gold font-semibold">{hijriDate}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5 relative z-10 pt-2">
        {/* Dynamic order: which vakit is next comes first */}
        {isSahurNext ? (
          <>
            {sahurCard}
            {iftarCard}
          </>
        ) : (
          <>
            {iftarCard}
            {sahurCard}
          </>
        )}

        {/* Alt bilgi - tarih zaten header'da, Güneş Doğuşu Sahur kartında */}
        <div className="pt-2 border-t border-slate-600/50 min-h-[2px]" aria-hidden />
      </CardContent>
    </Card>
  );
}
