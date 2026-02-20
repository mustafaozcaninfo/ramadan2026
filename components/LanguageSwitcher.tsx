'use client';

import { useRouter, usePathname } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const toggleLanguage = () => {
    const newLocale = locale === 'tr' ? 'en' : 'tr';
    router.replace(pathname, { locale: newLocale });
  };

  const currentLanguage = locale === 'tr' ? 'Turkish' : 'English';
  const targetLanguage = locale === 'tr' ? 'English' : 'Turkish';

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      size="default"
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-ramadan-green/50 hover:bg-slate-700/50 min-h-[44px]"
      aria-label={`Current language: ${currentLanguage}. Switch to ${targetLanguage}`}
      aria-pressed={false}
      lang={locale}
    >
      <Globe className="w-4 h-4 mr-2 text-ramadan-green" />
      <span className="font-semibold" lang={locale === 'tr' ? 'tr' : 'en'}>{locale === 'tr' ? 'EN' : 'TR'}</span>
    </Button>
  );
}
