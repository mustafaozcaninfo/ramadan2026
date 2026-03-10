import { Navigation } from '@/components/Navigation';
import { MenuButton } from '@/components/MenuButton';
import { OpsDashboardClient } from './OpsDashboardClient';
import { getTranslations } from 'next-intl/server';

export default async function OpsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('ops');

  return (
    <main className="min-h-screen bg-qatar-gradient page-with-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-3 sm:px-4 pb-4 sm:pb-6 relative z-10 safe-area-inset-top">
        <div className="mb-5 sm:mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-slate-300">{t('eyebrow')}</p>
              <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {t('subtitle')}
              </p>
            </div>
            <MenuButton locale={locale as 'tr' | 'en' | 'ar'} />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <OpsDashboardClient />
        </div>
      </div>
      <Navigation />
    </main>
  );
}
