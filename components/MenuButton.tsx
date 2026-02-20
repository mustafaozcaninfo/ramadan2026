'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { MenuDrawer } from './MenuDrawer';
import { useLocale } from 'next-intl';

export function MenuButton({ locale }: { locale: 'tr' | 'en' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentLocale = useLocale() as 'tr' | 'en';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label={locale === 'tr' ? 'Menü' : 'Menu'}
        className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/70 text-slate-200 shadow-lg backdrop-blur-sm hover:border-ramadan-green/70 hover:text-ramadan-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ramadan-green focus-visible:ring-offset-2"
      >
        <Menu className="w-5 h-5" />
      </button>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} locale={currentLocale} />
    </>
  );
}
