import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getRamadanDay, getPrayerTimes } from '@/lib/prayer';
import { PrayerTimeCard } from '@/components/PrayerTimeCard';
import { DuaOfTheDay } from '@/components/DuaOfTheDay';
import { NotificationButton } from '@/components/NotificationButton';
import { AzanButton } from '@/components/AzanButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');

  // Get today's prayer times with error handling
  let prayerData;
  try {
    prayerData = await getTodayPrayerTimes();
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    // Fallback to first day of Ramadan if API fails
    const { getPrayerTimes } = await import('@/lib/prayer');
    prayerData = await getPrayerTimes('2026-02-18');
  }

  const timings = prayerData.data.timings;
  const dateInfo = prayerData.data.date;

  // Get Ramadan day number
  const ramadanDay = getRamadanDay();

  // Format dates with locale support
  const dateLocale = locale === 'tr' ? tr : enUS;
  
  // Parse date from DD-MM-YYYY format or use readable date
  let dateObj: Date;
  if (dateInfo.gregorian.date && dateInfo.gregorian.date.includes('-')) {
    const [day, month, year] = dateInfo.gregorian.date.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
  } else {
    // Fallback: use today's date
    dateObj = new Date();
  }
  
  // Get next day's prayer times (for correct next-day countdown)
  const tomorrowObj = new Date(dateObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowIso = tomorrowObj.toISOString().split('T')[0];
  const nextDayData = await getPrayerTimes(tomorrowIso);
  const nextTimings = nextDayData.data.timings;
  
  // Format gregorian date based on locale
  const gregorianDate = format(dateObj, 'EEEE, d MMMM yyyy', { locale: dateLocale });
  
  // Format hijri date
  const hijriDate = dateInfo.hijri?.day && dateInfo.hijri?.month?.en
    ? `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`
    : '';

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
        {/* Decorative background elements - Daha belirgin */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ramadan-gold rounded-full blur-3xl"></div>
        </div>
        
        {/* Header with animated crescent moon - Mobil optimizasyon */}
        <div className="container mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6 relative z-10">
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-block mb-2 sm:mb-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent mb-1 drop-shadow-lg">
                {t('title')}
              </h1>
            </div>
            <p className="text-slate-200 text-sm sm:text-base font-medium">{t('subtitle')}</p>
            <div className="mt-2 sm:mt-3 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-qatar-maroon/30 backdrop-blur-sm rounded-full border border-qatar-maroon/40 shadow-lg">
              <span className="text-white text-xs sm:text-sm font-semibold">{tCommon('location')}</span>
            </div>
          </div>

        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {/* Prayer Times Card */}
          <PrayerTimeCard
            fajr={timings.Fajr}
            maghrib={timings.Maghrib}
            nextFajr={nextTimings.Fajr}
            nextMaghrib={nextTimings.Maghrib}
            sunrise={timings.Sunrise}
            hijriDate={hijriDate}
            gregorianDate={gregorianDate}
            ramadanDay={ramadanDay}
            locale={locale as 'tr' | 'en'}
          />

          {/* Dua of the Day */}
          <DuaOfTheDay locale={locale as 'tr' | 'en'} />

          {/* Notification Button */}
          <NotificationButton />

          {/* Azan Button */}
          <AzanButton />

          {/* Language Switcher (moved down) */}
          <div className="flex justify-end pt-2">
            <LanguageSwitcher />
          </div>

          {/* Calendar Link */}
          <Link href="/calendar">
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              {tCommon('calendar')}
            </Button>
          </Link>

          {/* Footer Info - Kompakt */}
          <div className="text-center text-xs text-slate-300 pt-4 border-t border-slate-600/50">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
              <p className="text-ramadan-green font-medium">{tCommon('officialQatarMethod')}</p>
            </div>
            <p className="mt-3 text-slate-500">
              {tCommon('source')}:{' '}
              <a
                href="https://aladhan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ramadan-green hover:text-ramadan-gold transition-colors font-medium"
              >
                Aladhan API
              </a>
            </p>
          </div>
        </div>
      </div>
      <Navigation />
    </main>
    </ErrorBoundary>
  );
}
