'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDuaOfTheDay } from '@/lib/duas';
import { BookOpen } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { CopyButton } from './CopyButton';
import { ShareButton } from './ShareButton';
import { useTranslations } from 'next-intl';

interface DuaOfTheDayProps {
  locale: 'tr' | 'en' | 'ar';
  /** Hijri Ramazan günü (1–30); API’den gelir, yoksa takvim gününe göre döngü. */
  ramadanDay?: number | null;
}

export function DuaOfTheDay({ locale, ramadanDay }: DuaOfTheDayProps) {
  const tCommon = useTranslations('common');
  const tUi = useTranslations('ui');
  const reduceMotion = useReducedMotion();
  const dua = getDuaOfTheDay(locale === 'ar' ? 'en' : locale, ramadanDay ?? null);
  const shareText = locale === 'ar'
    ? `${tCommon('duaOfTheDay')}\n\n${dua.arabic}`
    : `${dua.title}\n\n${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}`;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.28, ease: 'easeOut' }}
    >
      <Card 
        className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden"
        role="article"
        aria-label={tCommon('duaOfTheDay')}
      >
      <div className="absolute inset-0 bg-gradient-to-br from-ramadan-gold/10 via-transparent to-qatar-maroon/10 pointer-events-none" aria-hidden />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-ramadan-gold/30 rounded-lg">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-ramadan-gold" />
            </div>
            <CardTitle className="text-lg sm:text-xl text-amber-100 font-bold drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]">
              {tCommon('duaOfTheDay')}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton 
              text={shareText}
              label={tUi('copied')}
              className="h-8 px-2 sm:px-3 text-xs"
            />
            <ShareButton 
              title={dua.title}
              text={shareText}
              className="h-8 px-2 sm:px-3 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 relative z-10 pt-2">
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-slate-100">
            {locale === 'ar' ? tCommon('duaOfTheDay') : dua.title}
          </h3>
          <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border border-slate-600/40">
            <p className="text-xl sm:text-2xl text-right leading-relaxed text-ramadan-green font-arabic drop-shadow-lg" lang="ar">
              {dua.arabic}
            </p>
          </div>
          {locale !== 'ar' ? (
            <>
              <p className="text-xs sm:text-sm text-slate-300 italic mb-1.5 sm:mb-2 font-medium">{dua.transliteration}</p>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{dua.translation}</p>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
