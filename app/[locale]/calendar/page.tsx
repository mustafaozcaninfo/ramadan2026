import { getTranslations } from 'next-intl/server';
import { getRamadanPrayerTimes } from '@/lib/prayer';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Navigation } from '@/components/Navigation';
import { CalendarDayCard } from '@/components/CalendarDayCard';
import { Link } from '@/lib/i18n/routing';
export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('calendar');
  const tCommon = await getTranslations('common');

  let prayerTimes: Awaited<ReturnType<typeof getRamadanPrayerTimes>>;
  try {
    prayerTimes = await getRamadanPrayerTimes();
  } catch (error) {
    console.error('Error fetching Ramadan prayer times:', error);
    prayerTimes = [];
  }

  const startDate = new Date('2026-02-18');

  return (
    <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ramadan-gold rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6 relative z-10">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent mb-2 sm:mb-3 drop-shadow-lg">
            {t('title')}
          </h1>
          <div className="mt-2 sm:mt-3 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-qatar-maroon/30 backdrop-blur-sm rounded-full border border-qatar-maroon/40 shadow-lg">
            <p className="text-white text-xs sm:text-sm font-semibold">
              {tCommon('location')} – {tCommon('officialQatarMethod')}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-3 sm:mb-4">
            <LanguageSwitcher />
          </div>

          {prayerTimes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-300 mb-4">
                {locale === 'tr'
                  ? 'Takvim yüklenirken bir sorun oluştu.'
                  : 'An error occurred while loading the calendar.'}
              </p>
              <Button asChild>
                <Link href="/calendar">{locale === 'tr' ? 'Yeniden Dene' : 'Retry'}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {prayerTimes.map((day, index) => {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + index);
                return (
                  <CalendarDayCard
                    key={day.data.date.readable}
                    day={day}
                    dayNumber={index + 1}
                    locale={locale as 'tr' | 'en'}
                    date={date}
                  />
                );
              })}
            </div>
          )}

          <div className="text-center text-xs sm:text-sm text-slate-300 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-600/50">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-600/50 mb-2 sm:mb-3 shadow-md">
              <p className="text-ramadan-green font-medium">{tCommon('officialQatarMethod')}</p>
            </div>
            <p className="text-slate-400">
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
  );
}
