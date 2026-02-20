'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Info, Share2, MessageSquare, Calendar, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { ShareButton } from './ShareButton';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: 'tr' | 'en';
}

export function MenuDrawer({ isOpen, onClose, locale }: MenuDrawerProps) {
  const t = useTranslations('common');
  const tMenu = useTranslations('menu');

  const menuItems = [
    {
      icon: Home,
      label: t('appName'),
      href: '/',
      onClick: onClose,
    },
    {
      icon: Calendar,
      label: t('calendar'),
      href: '/calendar',
      onClick: onClose,
    },
    {
      icon: Settings,
      label: t('settings'),
      href: '#',
      onClick: () => {
        // Settings functionality can be added later
        onClose();
      },
    },
    {
      icon: Info,
      label: tMenu('about') || (locale === 'tr' ? 'Hakkında' : 'About'),
      href: '#',
      onClick: () => {
        // About modal can be added later
        onClose();
      },
    },
  ];

  const shareData = {
    title: t('appName'),
    text: locale === 'tr' 
      ? 'Ramazan 2026 Doha - İftar ve Sahur Takvimi'
      : 'Ramadan 2026 Doha - Iftar & Suhoor Schedule',
    url: typeof window !== 'undefined' ? window.location.origin : '',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700/50 shadow-2xl z-50 safe-area-inset-top safe-area-inset-bottom overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={tMenu('menu') || 'Menu'}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-800/95 backdrop-blur-md border-b border-slate-700/50 z-10 px-4 py-4 sm:py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-ramadan-green to-ramadan-gold bg-clip-text text-transparent">
                  {tMenu('menu') || (locale === 'tr' ? 'Menü' : 'Menu')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ramadan-green focus-visible:ring-offset-2"
                  aria-label={locale === 'tr' ? 'Menüyü kapat' : 'Close menu'}
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const content = (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-ramadan-green/50 transition-all cursor-pointer group"
                    onClick={item.onClick}
                  >
                    <div className="p-2 bg-ramadan-green/10 rounded-lg group-hover:bg-ramadan-green/20 transition-colors">
                      <Icon className="w-5 h-5 text-ramadan-green" />
                    </div>
                    <span className="flex-1 text-slate-200 font-medium">{item.label}</span>
                  </motion.div>
                );

                if (item.href === '#') {
                  return <div key={item.label}>{content}</div>;
                }

                return (
                  <Link key={item.label} href={item.href}>
                    {content}
                  </Link>
                );
              })}
            </div>

            {/* Share Section */}
            <div className="px-4 py-4 border-t border-slate-700/50">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  {tMenu('shareApp') || (locale === 'tr' ? 'Uygulamayı Paylaş' : 'Share App')}
                </h3>
                <ShareButton
                  title={shareData.title}
                  text={shareData.text}
                  url={shareData.url}
                  className="w-full justify-center"
                />
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-4 py-6 border-t border-slate-700/50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-xs text-slate-400"
              >
                <p className="mb-2">{t('appName')}</p>
                <p className="text-slate-500">
                  {t('location')} – {t('officialQatarMethod')}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
