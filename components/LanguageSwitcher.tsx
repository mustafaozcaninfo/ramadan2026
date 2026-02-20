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

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="ghost" 
      size="sm"
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-ramadan-green/50 hover:bg-slate-700/50"
    >
      <Globe className="w-4 h-4 mr-2 text-ramadan-green" />
      <span className="font-semibold">{locale === 'tr' ? 'EN' : 'TR'}</span>
    </Button>
  );
}
