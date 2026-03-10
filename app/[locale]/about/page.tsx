import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Navigation } from '@/components/Navigation';
import { AboutPageClient } from './AboutPageClient';
import { MenuButton } from '@/components/MenuButton';
import { getCityConfigFromCookie } from '@/lib/cityCookie';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');
  const cookieStore = await cookies();
  const cityConfig = getCityConfigFromCookie(cookieStore.get('ramadan-city')?.value);
  const selectedCityLabel = `${cityConfig.city}, ${cityConfig.country}`;
  const methodLabel = cityConfig.city === 'Doha' && cityConfig.country === 'Qatar'
    ? tCommon('officialQatarMethod')
    : tCommon('cityBasedMethod');

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ramadan-gold rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-4 sm:pb-6 relative z-10 safe-area-inset-top">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 mb-2 sm:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('title')}
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                {t('description')}
              </p>
            </div>
            <MenuButton locale={locale as 'tr' | 'en' | 'ar'} />
          </div>
        </div>

        {/* About Content */}
        <div className="max-w-3xl mx-auto">
          <AboutPageClient
            locale={locale as 'tr' | 'en' | 'ar'}
            selectedCityLabel={selectedCityLabel}
            methodLabel={methodLabel}
          />
        </div>
      </div>
      <Navigation />
    </main>
  );
}
