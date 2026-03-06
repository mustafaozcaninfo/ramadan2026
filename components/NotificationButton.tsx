'use client';

import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  areNotificationsEnabled,
  enableNotifications,
  disableNotifications,
  requestNotificationPermission,
} from '@/lib/notifications';
import { useAppStore } from '@/lib/store/useAppStore';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

function isIOSStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );
}

function isSafariOrIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /^((?!chrome|android).)*safari/i.test(ua) ||
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes('Safari') && !ua.includes('Chrome'))
  );
}

export function NotificationButton() {
  const t = useTranslations('notifications');
  const locale = useLocale() as 'tr' | 'en' | 'ar';
  const user = useAppStore((s) => s.user);
  const notificationsEnabledFromStore = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const reminderIntervals = useAppStore((s) => s.reminderIntervals);
  const [enabled, setEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const effectiveEnabled = user ? notificationsEnabledFromStore : enabled;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnabled(areNotificationsEnabled());
      setPermissionGranted('Notification' in window && Notification.permission === 'granted');
      setIsIOS(isSafariOrIOS() || isIOSStandalone());
    }
  }, []);

  const handleToggle = async () => {
    if (!permissionGranted) {
      const permission = await requestNotificationPermission();
      if (permission.granted) {
        setPermissionGranted(true);
        enableNotifications(locale as 'tr' | 'en', reminderIntervals.length ? reminderIntervals : undefined);
        setEnabled(true);
        setNotificationsEnabled(true);
        trackEvent('notification_enabled');
        toast.success(t('enableReminders'));
      } else if (permission.denied) {
        toast.error(t('permissionRequestMessage'));
      }
    } else {
      if (effectiveEnabled) {
        disableNotifications();
        setEnabled(false);
        setNotificationsEnabled(false);
        toast.success(t('disableNotifications'));
      } else {
        enableNotifications(locale as 'tr' | 'en', reminderIntervals.length ? reminderIntervals : undefined);
        setEnabled(true);
        setNotificationsEnabled(true);
        trackEvent('notification_enabled');
        toast.success(t('enableReminders'));
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        onClick={handleToggle}
        variant={effectiveEnabled && permissionGranted ? 'default' : 'outline'}
        className="w-full"
        aria-label={effectiveEnabled && permissionGranted ? t('disableNotifications') : t('enableReminders')}
      >
        {effectiveEnabled && permissionGranted ? (
          <>
            <Bell className="w-4 h-4 mr-2" />
            {t('disableNotifications')}
          </>
        ) : (
          <>
            <BellOff className="w-4 h-4 mr-2" />
            {t('enableReminders')}
          </>
        )}
      </Button>
      {user && (
        <p className="text-xs text-slate-400 text-center px-2" role="note">
          Synced to your account
        </p>
      )}
      {isIOS && (
        <p className="text-xs text-slate-400 text-center px-2" role="note">
          {t('iosNote')}
        </p>
      )}
      {!isIOS && (
        <p className="text-xs text-slate-400 text-center px-2" role="note">
          {t('safariNote')}
        </p>
      )}
    </div>
  );
}
