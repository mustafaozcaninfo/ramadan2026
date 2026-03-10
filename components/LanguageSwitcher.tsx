'use client';

import { useRouter, usePathname } from '@/lib/i18n/routing';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tCommon = useTranslations('common');

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    if (newLocale && newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 min-h-[44px]">
      <Globe className="w-4 h-4 text-ramadan-green" />
      <label className="sr-only" htmlFor="language-switcher">
        {tCommon('language')}
      </label>
      <select
        id="language-switcher"
        value={locale}
        onChange={handleChange}
        className="bg-transparent text-sm font-semibold text-slate-100 focus:outline-none"
      >
        <option value="tr">Türkçe</option>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
