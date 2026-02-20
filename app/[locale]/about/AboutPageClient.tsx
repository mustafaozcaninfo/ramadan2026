'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  BookOpen,
  Bell,
  Smartphone,
  WifiOff,
  Globe,
  MapPin,
  Calculator,
  Database,
  Package,
} from 'lucide-react';

interface AboutPageClientProps {
  locale: 'tr' | 'en';
}

export function AboutPageClient({ locale }: AboutPageClientProps) {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');

  const features = [
    {
      icon: Clock,
      title: t('featurePrayerTimes'),
      color: 'blue',
    },
    {
      icon: Calendar,
      title: t('featureCountdown'),
      color: 'ramadan-gold',
    },
    {
      icon: Calendar,
      title: t('featureCalendar'),
      color: 'green',
    },
    {
      icon: BookOpen,
      title: t('featureDuas'),
      color: 'amber',
    },
    {
      icon: Bell,
      title: t('featureNotifications'),
      color: 'purple',
    },
    {
      icon: Smartphone,
      title: t('featurePWA'),
      color: 'emerald',
    },
    {
      icon: WifiOff,
      title: t('featureOffline'),
      color: 'slate',
    },
    {
      icon: Globe,
      title: t('featureMultilingual'),
      color: 'cyan',
    },
  ];

  const infoItems = [
    {
      icon: MapPin,
      label: t('location'),
      value: tCommon('location'),
      iconClass: 'text-ramadan-green bg-ramadan-green/20',
    },
    {
      icon: Calculator,
      label: t('method'),
      value: tCommon('officialQatarMethod'),
      iconClass: 'text-ramadan-gold bg-ramadan-gold/20',
    },
    {
      icon: Database,
      label: t('dataSource'),
      value: 'Aladhan API',
      iconClass: 'text-blue-400 bg-blue-500/20',
    },
    {
      icon: Package,
      label: t('version'),
      value: t('versionNumber'),
      iconClass: 'text-slate-300 bg-slate-700/50',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ramadan-green/10 via-transparent to-qatar-maroon/10 pointer-events-none" aria-hidden />

          <CardHeader className="relative z-10 p-4 sm:p-5 pb-3">
            <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-ramadan-green to-ramadan-gold bg-clip-text text-transparent">
              {t('features')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-4 sm:p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = {
                  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                  'ramadan-gold': 'text-ramadan-gold bg-ramadan-gold/10 border-ramadan-gold/30',
                  green: 'text-ramadan-green bg-ramadan-green/10 border-ramadan-green/30',
                  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                  slate: 'text-slate-300 bg-slate-700/50 border-slate-600/50',
                  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                };

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm text-slate-200 font-medium">{feature.title}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ramadan-gold/10 via-transparent to-qatar-maroon/10 pointer-events-none" aria-hidden />

          <CardHeader className="relative z-10 p-4 sm:p-5 pb-3">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-100">
              {t('appName')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 p-4 sm:p-5 pt-0">
            <div className="space-y-3">
              {infoItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.iconClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-100">{item.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
