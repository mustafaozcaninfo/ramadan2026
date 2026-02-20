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
import { Calendar, Menu } from 'lucide-react';
import { format } from 'date-fns';
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

  // Format gregorian & hijri dates based on locale
  const dayName = format(dateObj, 'EEEE', { locale: dateLocale });
  const dayDate = format(dateObj, 'd MMMM yyyy', { locale: dateLocale });
  const gregorianDate = `${dayName}, ${dayDate}`;

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
          <div className="mb-4 sm:mb-6">
            {/* Top bar with date & menu */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="text-left">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-slate-300">
                  {locale === 'tr' ? 'Bugün' : 'Today'}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent drop-shadow-lg">
                  {gregorianDate}
                </h1>
                {hijriDate && (
                  <p className="mt-1 text-xs sm:text-sm text-ramadan-gold font-semibold">
                    {hijriDate}
                  </p>
                )}
                {ramadanDay !== null && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-800/70 border border-slate-600/60 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-100 shadow-ramadan-glow">
                    {locale === 'tr' ? `Ramazan ${ramadanDay}. Gün` : `Ramadan Day ${ramadanDay}`}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={locale === 'tr' ? 'Menü' : 'Menu'}
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/70 text-slate-200 shadow-lg backdrop-blur-sm hover:border-ramadan-green/70 hover:text-ramadan-green transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Hero banner with Ramadan image */}
            <div
              className="relative overflow-hidden rounded-2xl border border-ramadan-gold/40 bg-slate-900/60 shadow-2xl shadow-black/40"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0.9) 100%), url('/ramadan-bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-amber-200 uppercase tracking-[0.2em]">
                    {locale === 'tr' ? 'Ramazan 2026' : 'Ramadan 2026'}
                  </p>
                  <p className="mt-1 text-lg sm:text-2xl font-semibold text-amber-100 drop-shadow-md">
                    {locale === 'tr' ? 'Ramazan-ı Şerif Mübarek Olsun' : 'Ramadan Kareem'}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] sm:text-xs text-slate-100 border border-amber-300/40">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-ramadan-glow" />
                    {tCommon('location')}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end text-right text-xs text-slate-100/90">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-amber-200">
                    {locale === 'tr' ? 'İftar & Sahur' : 'Iftar & Suhoor'}
                  </span>
                  <span className="mt-1 text-sm font-semibold">
                    {locale === 'tr'
                      ? 'Resmi Qatar Metodu'
                      : 'Official Qatar Method'}
                  </span>
                </div>
              </div>
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
