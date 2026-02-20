import { getTranslations } from 'next-intl/server';
import { Navigation } from '@/components/Navigation';
import { AboutPageClient } from './AboutPageClient';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('about');
  const tCommon = await getTranslations('common');

  return (
    <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ramadan-gold rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent mb-2 sm:mb-3 drop-shadow-lg">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {/* About Content */}
        <div className="max-w-3xl mx-auto">
          <AboutPageClient locale={locale as 'tr' | 'en'} />
        </div>
      </div>
      <Navigation />
    </main>
  );
}
