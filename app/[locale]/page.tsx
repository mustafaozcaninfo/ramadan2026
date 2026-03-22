import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import {
  getTodayPrayerTimes,
  getPrayerTimes,
  hijriRamadanDayFromResponse,
  getCityDateString,
} from '@/lib/prayer';
import { getCityConfigFromCookie } from '@/lib/cityCookie';
import { PrayerTimeCard } from '@/components/PrayerTimeCard';
import { DuaOfTheDay } from '@/components/DuaOfTheDay';
import { DailyHatim } from '@/components/DailyHatim';
import { AzanButton } from '@/components/AzanButton';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MenuButton } from '@/components/MenuButton';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Calendar, Settings, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tHome = await getTranslations('home');
  const tCommon = await getTranslations('common');

  const cookieStore = await cookies();
  const cityConfig = getCityConfigFromCookie(cookieStore.get('ramadan-city')?.value);
  const tz = cityConfig.timezone ?? 'Asia/Qatar';

  let prayerData;
  let usedFallbackData = false;
  try {
    prayerData = await getTodayPrayerTimes(cityConfig);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    const fallbackDate = getCityDateString(cityConfig);
    prayerData = await getPrayerTimes(fallbackDate, cityConfig);
    usedFallbackData = true;
  }

  const timings = prayerData.data.timings;
  const dateInfo = prayerData.data.date;

  const ramadanDay = hijriRamadanDayFromResponse(dateInfo.hijri);

  const dateLocale = locale === 'tr' ? tr : enUS;

  let dateObj: Date;
  let currentIsoDate = '';
  if (dateInfo.gregorian.date && dateInfo.gregorian.date.includes('-')) {
    const [day, month, year] = dateInfo.gregorian.date.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
    currentIsoDate = `${year.toString().padStart(4, '0')}-${month
      .toString()
      .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } else {
    dateObj = new Date();
    currentIsoDate = dateObj.toISOString().split('T')[0];
  }

  const tomorrowObj = new Date(dateObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowIso = `${tomorrowObj.getFullYear()}-${String(tomorrowObj.getMonth() + 1).padStart(2, '0')}-${String(tomorrowObj.getDate()).padStart(2, '0')}`;
  const nextDayData = await getPrayerTimes(tomorrowIso, cityConfig);
  const nextTimings = nextDayData.data.timings;

  const dayName = format(dateObj, 'EEEE', { locale: dateLocale });
  const dayDate = format(dateObj, 'd MMMM yyyy', { locale: dateLocale });
  const gregorianDate = `${dayName}, ${dayDate}`;

  const hijriDate =
    dateInfo.hijri?.day && dateInfo.hijri?.month?.en
      ? `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`
      : '';

  const selectedCityLabel = `${cityConfig.city}, ${cityConfig.country}`;
  const methodLabel =
    cityConfig.city === 'Doha' && cityConfig.country === 'Qatar'
      ? tCommon('officialQatarMethod')
      : tCommon('cityBasedMethod');
  const heroTitle = tHome('todayPrayerTitle');
  const heroSubtitle = tHome('todayPrayerSubtitle');
  const goTodayLabel = tHome('goToday');
  const quickSettingsLabel = tHome('quickSettings');
  const fallbackNotice = tHome('fallbackDataNotice');

  const calYear = dateObj.getFullYear();
  const calMonth = dateObj.getMonth() + 1;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -top-20 -left-20 w-[28rem] h-[28rem] bg-ramadan-green rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] bg-qatar-maroon rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 pb-4 sm:pb-6 relative z-10 safe-area-inset-top">
          <div className="mb-5 sm:mb-7">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="text-left">
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-slate-300">
                  {tHome('todayLabel')}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                  {gregorianDate}
                </h1>
                {hijriDate && (
                  <p className="mt-1 text-xs sm:text-sm text-ramadan-gold font-semibold">
                    {hijriDate}
                  </p>
                )}
                {ramadanDay !== null && (
                  <p className="mt-2 inline-flex items-center rounded-full bg-slate-800/70 border border-slate-600/60 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-100 shadow-ramadan-glow">
                    {tHome('ramadanDay', { day: ramadanDay })}
                  </p>
                )}
              </div>
              <MenuButton locale={locale as 'tr' | 'en' | 'ar'} />
            </div>

            <div
              className="relative overflow-hidden rounded-2xl border border-ramadan-gold/40 bg-slate-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.64) 45%, rgba(15,23,42,0.9) 100%), url('/ramadan-bg.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="px-4 sm:px-6 py-5 sm:py-6 flex items-start justify-between gap-4">
                <div className="max-w-xl">
                  <p className="text-[11px] sm:text-xs font-medium text-amber-200 uppercase tracking-[0.22em]">
                    {tHome('heroKicker')}
                  </p>
                  <p className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-amber-100 drop-shadow-md">
                    {heroTitle}
                  </p>
                  <p className="mt-2 text-sm text-slate-200/90">{heroSubtitle}</p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] sm:text-xs text-slate-100 border border-amber-300/40">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-ramadan-glow" />
                    {selectedCityLabel}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end text-right text-xs text-slate-100/90 gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ramadan-gold/40 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-amber-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tHome('prayerTimesBadge')}
                  </span>
                  <span className="text-sm font-semibold">{methodLabel}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href={`/calendar?year=${calYear}&month=${calMonth}&today=1`}
                aria-label={goTodayLabel}
              >
                <Button className="w-full bg-ramadan-green hover:bg-emerald-500 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  {goTodayLabel}
                </Button>
              </Link>
              <Link href="/settings" aria-label={quickSettingsLabel}>
                <Button
                  variant="outline"
                  className="w-full border-slate-500/80 bg-slate-900/35 hover:bg-slate-800/80"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {quickSettingsLabel}
                </Button>
              </Link>
            </div>

            {usedFallbackData && (
              <div
                className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2.5 text-xs sm:text-sm text-amber-100"
                role="status"
                aria-live="polite"
              >
                {fallbackNotice}
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <PrayerTimeCard
              fajr={timings.Fajr}
              dhuhr={timings.Dhuhr}
              asr={timings.Asr}
              maghrib={timings.Maghrib}
              isha={timings.Isha}
              nextFajr={nextTimings.Fajr}
              sunrise={timings.Sunrise}
              currentDateIso={currentIsoDate}
              nextDateIso={tomorrowIso}
              timezone={tz}
              hijriDate={hijriDate}
              gregorianDate={gregorianDate}
              locale={locale as 'tr' | 'en' | 'ar'}
            />

            <DailyHatim ramadanDay={ramadanDay} locale={locale as 'tr' | 'en' | 'ar'} />

            <AzanButton />

            <DuaOfTheDay locale={locale as 'tr' | 'en' | 'ar'} ramadanDay={ramadanDay} />

            <div className="text-center text-xs text-slate-300 pt-4 border-t border-slate-600/50">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
                <p className="text-ramadan-green font-medium">
                  {selectedCityLabel} • {methodLabel}
                </p>
              </div>
              <p className="mt-3 text-slate-300/85">
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
