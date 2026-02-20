'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationButton } from '@/components/NotificationButton';
import { Globe, Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface SettingsPageClientProps {
  locale: 'tr' | 'en';
}

export function SettingsPageClient({ locale }: SettingsPageClientProps) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');

  const settingsSections = [
    {
      icon: Globe,
      title: t('language'),
      description: t('languageDescription'),
      component: <LanguageSwitcher />,
    },
    {
      icon: Bell,
      title: t('notifications'),
      description: t('notificationsDescription'),
      component: <NotificationButton />,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {settingsSections.map((section, index) => {
        const Icon = section.icon;
        return (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-700/95 via-slate-800/90 to-slate-900/95 border-slate-600/60 backdrop-blur-sm shadow-xl shadow-black/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-ramadan-green/10 via-transparent to-qatar-maroon/10 pointer-events-none" aria-hidden />

              <CardHeader className="relative z-10 p-4 sm:p-5 pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-ramadan-green/20 rounded-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-ramadan-green" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-100">
                      {section.title}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-4 sm:p-5 pt-0">
                {section.component}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
