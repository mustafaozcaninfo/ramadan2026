import { cookies } from 'next/headers';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import {
  getMonthPrayerTimes,
  getYearMonthInCityTimezone,
  getCityDateString,
} from '@/lib/prayer';
import { getCityConfigFromNextCookies } from '@/lib/cityCookie';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navigation } from '@/components/Navigation';
import { ScrollToToday } from '@/components/ScrollToToday';
import { Link } from '@/lib/i18n/routing';
import { CalendarCardSkeleton } from '@/components/LoadingSkeleton';
import { MenuButton } from '@/components/MenuButton';
import { format } from 'date-fns';
import { tr, enUS, arSA } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPageClient = dynamic(
  () => import('./CalendarPageClient').then((m) => ({ default: m.CalendarPageClient })),
  {
    loading: () => (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CalendarCardSkeleton key={i} />
        ))}
      </div>
    ),
  }
);

function parseYearMonthParam(
  raw: string | string[] | undefined,
  fallback: number,
  kind: 'year' | 'month'
): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return fallback;
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  if (kind === 'month') {
    if (n < 1 || n > 12) return fallback;
    return n;
  }
  if (n < 2000 || n > 2100) return fallback;
  return n;
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const t = await getTranslations('calendar');
  const tCommon = await getTranslations('common');

  const cookieStore = await cookies();
  const cityConfig = getCityConfigFromNextCookies(cookieStore);
  const selectedCityLabel = `${cityConfig.city}, ${cityConfig.country}`;
  const isTr = locale === 'tr';
  const isAr = locale === 'ar';
  const methodLabel =
    cityConfig.city === 'Doha' && cityConfig.country === 'Qatar'
      ? tCommon('officialQatarMethod')
      : tCommon('cityBasedMethod');

  const { year: defaultYear, month: defaultMonth } = getYearMonthInCityTimezone(cityConfig);
  const year = parseYearMonthParam(resolvedSearchParams.year, defaultYear, 'year');
  const month = parseYearMonthParam(resolvedSearchParams.month, defaultMonth, 'month');

  let prayerTimes: Awaited<ReturnType<typeof getMonthPrayerTimes>>;
  try {
    prayerTimes = await getMonthPrayerTimes(year, month, cityConfig);
  } catch (error) {
    console.error('Error fetching month prayer times:', error);
    prayerTimes = [];
  }

  const autoScrollToToday = resolvedSearchParams.today === '1';
  const startDate = new Date(year, month - 1, 1);

  const dateLocale = isTr ? tr : isAr ? arSA : enUS;
  const monthYearLabel = format(new Date(year, month - 1, 15), 'LLLL yyyy', {
    locale: dateLocale,
  });

  const cityTodayIso = getCityDateString(cityConfig);
  const [ty, tm, td] = cityTodayIso.split('-').map(Number);
  const todayDayInMonth =
    ty === year && tm === month && td >= 1 && td <= 31 ? td : null;

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-4 sm:pb-6 relative z-10 safe-area-inset-top">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('title')}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-brand-gold/95 mb-2">
                {t('monthNav', { monthYear: monthYearLabel })}
              </p>
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-qatar-maroon/30 backdrop-blur-sm rounded-full border border-qatar-maroon/40 shadow-lg">
                  <p className="text-white text-xs sm:text-sm font-semibold">
                    {selectedCityLabel} – {methodLabel}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="border-slate-500/80 bg-slate-900/40" asChild>
                    <Link
                      href={`/calendar?year=${prev.y}&month=${prev.m}`}
                      aria-label={t('prevMonth')}
                    >
                      <ChevronLeft className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">{t('prevMonth')}</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-500/80 bg-slate-900/40" asChild>
                    <Link
                      href={`/calendar?year=${next.y}&month=${next.m}`}
                      aria-label={t('nextMonth')}
                    >
                      <span className="hidden sm:inline">{t('nextMonth')}</span>
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <MenuButton locale={locale as 'tr' | 'en' | 'ar'} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 flex-wrap">
            {prayerTimes.length > 0 && todayDayInMonth !== null && (
              <ScrollToToday todayDayInMonth={todayDayInMonth} />
            )}
            <LanguageSwitcher />
          </div>

          {prayerTimes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-300 mb-4">{t('loadError')}</p>
              <Button asChild>
                <Link href="/calendar">{t('retry')}</Link>
              </Button>
            </div>
          ) : (
            <CalendarPageClient
              prayerTimes={prayerTimes}
              startDate={startDate}
              locale={locale as 'tr' | 'en' | 'ar'}
              autoScrollToToday={autoScrollToToday}
              cityTodayIso={cityTodayIso}
              todayDayInMonth={todayDayInMonth}
            />
          )}

          <div className="text-center text-xs sm:text-sm text-slate-300 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-600/50">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 mb-2 sm:mb-3 shadow-md">
              <p className="text-brand-green font-medium">
                {selectedCityLabel} • {methodLabel}
              </p>
            </div>
            <p className="text-slate-400">
              {tCommon('source')}:{' '}
              <a
                href="https://aladhan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:text-brand-gold transition-colors font-medium"
              >
                Aladhan API
              </a>
            </p>
          </div>
        </div>
      </div>
      <Navigation />
    </main>
  );
}
