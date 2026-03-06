'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';

const LivePlayer = dynamic(
  () => import('@/components/LivePlayer').then((m) => ({ default: m.LivePlayer })),
  { ssr: false, loading: () => <div className="min-h-[220px] sm:min-h-[280px] flex items-center justify-center bg-slate-800/60 text-slate-400">Loading...</div> }
);
import { Link } from '@/lib/i18n/routing';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ArrowLeft, Tv, Radio, ExternalLink } from 'lucide-react';

const CHANNELS = [
  {
    id: 'qtv1',
    nameKey: 'channel1',
    nameAr: 'قناة قطر 1',
    src: 'https://qatartv.akamaized.net/hls/live/2026573/qtv1/master.m3u8',
  },
  {
    id: 'qtv2',
    nameKey: 'channel2',
    nameAr: 'قناة قطر 2',
    src: 'https://qatartv.akamaized.net/hls/live/2026574/qtv2/master.m3u8',
  },
] as const;

export default function LivePage() {
  const t = useTranslations('live');
  const locale = useLocale() as 'tr' | 'en';
  const [selectedChannel, setSelectedChannel] = useState<(typeof CHANNELS)[number]>(CHANNELS[0]);

  return (
    <main className="min-h-screen bg-qatar-gradient pb-20 safe-area-inset-bottom relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-ramadan-green rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-qatar-maroon rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-ramadan-gold rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 safe-area-inset-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl border border-slate-700/60 bg-slate-900/50 hover:bg-slate-800/80 hover:border-ramadan-green/50"
              aria-label={t('back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex flex-col items-center">
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-ramadan-green via-ramadan-gold to-qatar-maroon bg-clip-text text-transparent drop-shadow-lg">
              <Tv className="w-6 h-6 text-ramadan-gold shrink-0" />
              {t('title')}
            </h1>
            <p className="mt-1 text-xs text-slate-400 hidden sm:block">{t('subtitle')}</p>
          </div>
          <div className="w-11" />
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-5">
          {/* Channel selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-xl p-4 shadow-xl shadow-black/20"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Radio className="w-4 h-4 text-ramadan-gold" />
              {t('selectChannel')}
            </p>
            <div className="flex gap-3">
              {CHANNELS.map((ch, i) => {
                const isActive = selectedChannel.id === ch.id;
                return (
                  <motion.button
                    key={ch.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    onClick={() => setSelectedChannel(ch)}
                    className={`flex-1 rounded-xl py-4 px-4 font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-ramadan-green to-emerald-700 text-white border-2 border-ramadan-green/50 shadow-lg shadow-ramadan-green/25 scale-[1.02]'
                        : 'bg-slate-700/40 text-slate-400 border-2 border-transparent hover:border-slate-600 hover:text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      )}
                      {t(ch.nameKey)}
                    </span>
                    <span className="mt-1 block text-xs opacity-90" dir="rtl">
                      {ch.nameAr}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30"
          >
            <AnimatePresence mode="wait">
              <LivePlayer
                key={selectedChannel.id}
                src={selectedChannel.src}
                channelName={t(selectedChannel.nameKey)}
                locale={locale}
                className="min-h-[220px] sm:min-h-[280px]"
              />
            </AnimatePresence>
          </motion.div>

          {/* Footer - Source */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-slate-700/40 bg-slate-800/40 backdrop-blur-sm px-4 py-3"
          >
            <p className="text-xs text-slate-500 text-center">
              {t('sourceNote')}{' '}
              <a
                href="https://www.qtv.qa/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ramadan-green hover:text-ramadan-gold transition-colors font-medium"
              >
                qtv.qa
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      <Navigation />
    </main>
  );
}
