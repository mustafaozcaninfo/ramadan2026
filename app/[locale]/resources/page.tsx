import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('resources');

  return (
    <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-ramadan-gold rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 safe-area-inset-top">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl border border-slate-700/60 bg-slate-900/50 hover:bg-slate-800/80 hover:border-ramadan-green/50"
              aria-label={locale === 'tr' ? 'Geri' : locale === 'ar' ? 'رجوع' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent drop-shadow-lg">
              <BookOpen className="w-6 h-6 text-ramadan-gold shrink-0" />
              {t('title')}
            </h1>
            <p className="mt-1 text-xs text-slate-400 hidden sm:block">{t('subtitle')}</p>
          </div>
          <div className="w-11" />
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          <section
            className="rounded-xl border border-slate-600/60 bg-slate-800/60 p-4"
            aria-labelledby="tesbihat-heading"
          >
            <h2 id="tesbihat-heading" className="text-lg font-semibold text-slate-100 mb-3">
              {t('title')}
            </h2>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-ramadan-gold mt-0.5">•</span>
                <span>{t('afterFajr')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ramadan-gold mt-0.5">•</span>
                <span>{t('afterMaghrib')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-ramadan-gold mt-0.5">•</span>
                <span>{t('generalDhikr')}</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              {locale === 'tr'
                ? 'Tesbihat ve zikir metinleri için güvenilir kaynaklardan bilgi alınız.'
                : locale === 'ar'
                  ? 'راجع مصادر موثوقة لنصوص التسبيح والذكر.'
                  : 'Refer to trusted sources for full tasbih and dhikr texts.'}
            </p>
          </section>
        </div>
      </div>
      <Navigation />
    </main>
  );
}
