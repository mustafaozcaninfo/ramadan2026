'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun, Clock3 } from 'lucide-react';
import { Countdown } from './Countdown';
import { motion, useReducedMotion } from 'framer-motion';

interface PrayerTimeCardProps {
  fajr: string; // Sahur
  dhuhr: string;
  asr: string;
  maghrib: string; // İftar
  isha: string;
  nextFajr: string; // Bir sonraki gün Sahur
  nextMaghrib: string; // Bir sonraki gün İftar
  sunrise: string;
  hijriDate: string;
  gregorianDate: string;
  ramadanDay: number | null; // Ramazan günü (1-30)
  currentDateIso: string; // YYYY-MM-DD for today's Doha date
  nextDateIso: string; // YYYY-MM-DD for next day's Doha date
  locale: 'tr' | 'en' | 'ar';
}

export function PrayerTimeCard({
  fajr,
  dhuhr,
  asr,
  maghrib,
  isha,
  nextFajr,
  nextMaghrib,
  sunrise,
  hijriDate,
  gregorianDate,
  ramadanDay,
  currentDateIso,
  nextDateIso,
  locale,
}: PrayerTimeCardProps) {
  const reduceMotion = useReducedMotion();
  const L = (trText: string, enText: string, arText: string) =>
    locale === 'tr' ? trText : locale === 'ar' ? arText : enText;

  // Calculate current status based on explicit Doha dates to avoid timezone drift
  const now = new Date();

  const makeDohaDateTime = (isoDate: string, time: string): Date => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    // Construct ISO string with explicit +03:00 offset for Doha
    const yyyy = year.toString().padStart(4, '0');
    const mm = (month ?? 1).toString().padStart(2, '0');
    const dd = (day ?? 1).toString().padStart(2, '0');
    const hh = (hours ?? 0).toString().padStart(2, '0');
    const min = (minutes ?? 0).toString().padStart(2, '0');
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+03:00`);
  };

  const todayFajrDate = makeDohaDateTime(currentDateIso, fajr);
  const todayDhuhrDate = makeDohaDateTime(currentDateIso, dhuhr);
  const todayAsrDate = makeDohaDateTime(currentDateIso, asr);
  const todayMaghribDate = makeDohaDateTime(currentDateIso, maghrib);
  const todayIshaDate = makeDohaDateTime(currentDateIso, isha);
  const nextFajrDate = makeDohaDateTime(nextDateIso, nextFajr);
  const nextMaghribDate = makeDohaDateTime(nextDateIso, nextMaghrib);

  // Has today's Sahur / Iftar passed (in Doha time)?
  const sahurHasPassedToday = now >= todayFajrDate;
  const iftarHasPassedToday = now >= todayMaghribDate;

  // Determine which event is next (for card ordering)
  const isSahurNext = now < todayFajrDate || now >= todayMaghribDate;

  // Countdown targets: if today's vakit geçtiyse, bir sonraki günün tam tarihine göre
  const sahurTargetDate = sahurHasPassedToday ? nextFajrDate : todayFajrDate;
  const iftarTargetDate = iftarHasPassedToday ? nextMaghribDate : todayMaghribDate;

  type PrayerSlot = {
    key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    date: Date;
    time: string;
    labelTr: string;
    labelEn: string;
  };

  const prayerSlots: PrayerSlot[] = [
    { key: 'fajr', date: todayFajrDate, time: fajr, labelTr: 'İmsak', labelEn: 'Fajr' },
    { key: 'dhuhr', date: todayDhuhrDate, time: dhuhr, labelTr: 'Öğle', labelEn: 'Dhuhr' },
    { key: 'asr', date: todayAsrDate, time: asr, labelTr: 'İkindi', labelEn: 'Asr' },
    { key: 'maghrib', date: todayMaghribDate, time: maghrib, labelTr: 'Akşam', labelEn: 'Maghrib' },
    { key: 'isha', date: todayIshaDate, time: isha, labelTr: 'Yatsı', labelEn: 'Isha' },
    { key: 'fajr', date: nextFajrDate, time: nextFajr, labelTr: 'İmsak', labelEn: 'Fajr' },
  ];

  const nextPrayer =
    prayerSlots.find((slot) => slot.date.getTime() > now.getTime()) ?? prayerSlots[0];
  const nextEventName =
    locale === 'tr'
      ? `Sıradaki Vakit: ${nextPrayer.labelTr}`
      : locale === 'ar'
        ? `الوقت القادم: ${nextPrayer.labelEn}`
        : `Next Prayer: ${nextPrayer.labelEn}`;
  const nextEventTime = nextPrayer.time;

  // Labels: belirt if it's for tomorrow
  const sahurLabel =
    locale === 'tr'
      ? sahurHasPassedToday
        ? 'Yarınki Sahura Kalan Süre'
        : 'Kalan Süre'
      : locale === 'ar'
        ? sahurHasPassedToday
          ? 'الوقت المتبقي لسحور الغد'
          : 'الوقت المتبقي'
        : sahurHasPassedToday
          ? "Time until tomorrow's Suhoor"
          : 'Time Remaining';

  const iftarLabel =
    locale === 'tr'
      ? iftarHasPassedToday
        ? 'Yarınki İftara Kalan Süre'
        : 'Kalan Süre'
      : locale === 'ar'
        ? iftarHasPassedToday
          ? 'الوقت المتبقي لإفطار الغد'
          : 'الوقت المتبقي'
        : iftarHasPassedToday
          ? "Time until tomorrow's Iftar"
          : 'Time Remaining';

  // Check if we're past midnight relative to today's Fajr in Doha – this is \"Sahur Öncesi\"
  const isAfterMidnight = now < todayFajrDate;
  
  // Status logic (Doha gününe göre; gece yarısı sonrası “sonraki gün” sayılır):
  // 1. Gece yarısı – Sahur: "Sahur Öncesi"
  // 2. Sahur – İftar: "Oruçlu"
  // 3. İftar – gece yarısı: "İftar Vakti"
  const isBeforeSahur = isAfterMidnight;
  const isFasting = now >= todayFajrDate && now < todayMaghribDate;
  const isIftar = now >= todayMaghribDate && !isAfterMidnight;

  // Calculate fasting duration (how long we've been fasting today)
  const getFastingDuration = () => {
    if (isFasting) {
      // Currently fasting: calculate from Sahur time to now
      const diff = now.getTime() - todayFajrDate.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return locale === 'tr'
          ? `Bugün ${hours} saat ${minutes} dakika oruç tutuldu`
          : locale === 'ar'
            ? `صمت اليوم ${hours}س ${minutes}د`
            : `Fasted ${hours}h ${minutes}m today`;
      }
      return locale === 'tr'
        ? `Bugün ${minutes} dakika oruç tutuldu`
        : locale === 'ar'
          ? `صمت اليوم ${minutes}د`
          : `Fasted ${minutes}m today`;
    }
    if (isIftar) {
      // Iftar time: calculate total fasting duration (Sahur to Iftar)
      const diff = todayMaghribDate.getTime() - todayFajrDate.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return locale === 'tr'
          ? `Bugün ${hours} saat ${minutes} dakika oruç tutuldu`
          : locale === 'ar'
            ? `صمت اليوم ${hours}س ${minutes}د`
            : `Fasted ${hours}h ${minutes}m today`;
      }
      return locale === 'tr'
        ? `Bugün ${minutes} dakika oruç tutuldu`
        : locale === 'ar'
          ? `صمت اليوم ${minutes}د`
          : `Fasted ${minutes}m today`;
    }
    return null;
  };

  const getStatusBadge = () => {
    const fastingDuration = getFastingDuration();
    
    if (isIftar) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center rounded-full border-2 border-amber-500 bg-gradient-to-r from-amber-500/90 to-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-amber-500/30">
            {L('İftar Vakti', 'Iftar Time', 'وقت الإفطار')}
          </span>
          {fastingDuration && (
            <span className="text-[10px] text-amber-200/80 font-medium text-right">
              {fastingDuration}
            </span>
          )}
        </div>
      );
    }
    if (isFasting) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center rounded-full border-2 border-emerald-500 bg-gradient-to-r from-emerald-600/90 to-emerald-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30">
            {L('Oruçlu', 'Fasting', 'صائم')}
          </span>
          {fastingDuration && (
            <span className="text-[10px] text-emerald-200/80 font-medium text-right">
              {fastingDuration}
            </span>
          )}
        </div>
      );
    }
    if (isBeforeSahur) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex items-center rounded-full border-2 border-slate-500 bg-gradient-to-r from-slate-600/90 to-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-slate-500/30">
            {L('Sahur Öncesi', 'Before Suhoor', 'قبل السحور')}
          </span>
          <span className="text-[10px] text-slate-300/80 font-medium text-right">
            {L('Henüz oruç başlamadı', 'Fasting has not started yet', 'لم يبدأ الصيام بعد')}
          </span>
        </div>
      );
    }
    return null;
  };

  // Sahur card - Güneş Doğuşu sahur ile alakalı (Fajr sonrası) sağ alt köşede
  const sahurCard = (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.28, ease: 'easeOut' }}
      className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 rounded-xl p-4 sm:p-5 border border-blue-500/60 shadow-lg shadow-blue-500/30 backdrop-blur-sm hover:border-blue-400/80 transition-all duration-300 relative flex flex-col"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-1.5 sm:p-2 bg-blue-500/30 rounded-lg">
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-slate-100">
          {L('Sahur Vakti', 'Suhoor Time', 'وقت السحور')}
        </h3>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 tabular-nums drop-shadow-lg">
        {sahurHasPassedToday ? nextFajr : fajr}
      </div>
      <div className="flex-1">
        <Countdown
          targetTime={sahurHasPassedToday ? nextFajr : fajr}
          targetDateTime={sahurTargetDate}
          label={sahurLabel}
          locale={locale}
          variant="sahur"
        />
      </div>
      {/* Güneş Doğuşu: flex layout ile mobilde countdown altında, desktop'ta sağ altta */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400 sm:mt-4">
        <Sun className="w-3.5 h-3.5 shrink-0 text-amber-400/80" aria-hidden />
        <span className="truncate">
          {L('Güneş Doğuşu', 'Sunrise', 'الشروق')}: <span className="text-slate-200 font-semibold tabular-nums">{sunrise}</span>
        </span>
      </div>
    </motion.div>
  );

  // Iftar card - Daha canlı ve kompakt
  const iftarCard = (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.28, ease: 'easeOut' }}
      className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 rounded-xl p-4 sm:p-5 border border-ramadan-gold/60 shadow-lg shadow-ramadan-gold/40 backdrop-blur-sm hover:border-ramadan-gold/80 transition-all duration-300 relative overflow-hidden"
    >
      {/* Gold glow effect - Daha belirgin */}
      <div className="absolute inset-0 bg-gradient-to-br from-ramadan-gold/10 to-transparent pointer-events-none"></div>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
        <div className="p-1.5 sm:p-2 bg-ramadan-gold/30 rounded-lg">
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-ramadan-gold" />
        </div>
        <h3 className="font-semibold text-base sm:text-lg text-slate-100">
          {L('İftar Vakti', 'Iftar Time', 'وقت الإفطار')}
        </h3>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-ramadan-gold mb-2 sm:mb-3 tabular-nums drop-shadow-lg relative z-10">
        {iftarHasPassedToday ? nextMaghrib : maghrib}
      </div>
      <div className="relative z-10">
        <Countdown
          targetTime={iftarHasPassedToday ? nextMaghrib : maghrib}
          targetDateTime={iftarTargetDate}
          label={iftarLabel}
          locale={locale}
          variant="iftar"
        />
      </div>
    </motion.div>
  );

  return (
    <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-qatar-maroon/10 via-transparent to-ramadan-green/10 pointer-events-none" aria-hidden />

      <CardHeader className="relative z-10 p-4 sm:p-5 pb-3 sm:pb-4">
        {/* Status Section - Prominent and informative */}
        <div className="mb-3">
          {getStatusBadge()}
        </div>
        
        {/* Title Section - Clean and minimal */}
        <div className="mb-2 space-y-2">
          <CardTitle className="text-base sm:text-lg text-amber-100 font-bold drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
            {L('Namaz Vakitleri', 'Prayer Times', 'مواقيت الصلاة')}
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-500/50 bg-slate-900/35 px-3 py-2 text-xs sm:text-sm text-slate-100">
              <Clock3 className="w-4 h-4 text-ramadan-gold" />
              <span>{nextEventName}</span>
              <span className="font-bold tabular-nums text-ramadan-gold">{nextEventTime}</span>
            </div>
            <div className="inline-flex items-center rounded-lg border border-slate-500/50 bg-slate-900/35 px-3 py-2 text-[11px] sm:text-xs text-slate-200">
              {hijriDate || gregorianDate}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-5 sm:space-y-6 relative z-10">
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
