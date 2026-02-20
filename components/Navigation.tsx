'use client';

import { Link } from '@/lib/i18n/routing';
import { usePathname } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navigation() {
  const t = useTranslations('common');
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('appName'), icon: Home },
    { href: '/calendar', label: t('calendar'), icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/98 via-slate-900/95 to-slate-900/90 backdrop-blur-md border-t border-slate-700/50 z-50 safe-area-inset-bottom shadow-2xl shadow-black/20">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around py-2 sm:py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/' && pathname === '/tr');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-2 rounded-xl transition-all duration-300 min-h-[44px] min-w-[44px] touch-manipulation relative',
                  isActive
                    ? 'text-ramadan-green bg-gradient-to-b from-ramadan-green/10 to-transparent'
                    : 'text-slate-400 active:text-ramadan-green hover:text-slate-300'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-ramadan-green/5 to-transparent rounded-xl"></div>
                )}
                <Icon className={cn(
                  'w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-transform',
                  isActive && 'scale-110 drop-shadow-lg'
                )} />
                <span className={cn(
                  'text-[10px] sm:text-xs leading-tight text-center relative z-10 font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
