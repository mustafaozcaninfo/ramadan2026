'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDuaOfTheDay } from '@/lib/duas';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface DuaOfTheDayProps {
  locale: 'tr' | 'en';
}

export function DuaOfTheDay({ locale }: DuaOfTheDayProps) {
  const dua = getDuaOfTheDay(locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-ramadan-gold/10 via-transparent to-qatar-maroon/10 pointer-events-none" aria-hidden />

      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-ramadan-gold/30 rounded-lg">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-ramadan-gold" />
          </div>
          <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-ramadan-gold to-ramadan-green bg-clip-text text-transparent font-bold">
            {locale === 'tr' ? 'Günün Duası' : 'Dua of the Day'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 relative z-10 pt-2">
        <div>
          <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-slate-100">{dua.title}</h3>
          <div className="bg-slate-700/50 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3 border border-slate-600/40">
            <p className="text-xl sm:text-2xl text-right leading-relaxed text-ramadan-green font-arabic drop-shadow-lg">
              {dua.arabic}
            </p>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 italic mb-1.5 sm:mb-2 font-medium">{dua.transliteration}</p>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{dua.translation}</p>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
