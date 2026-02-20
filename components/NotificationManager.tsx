'use client';

import { useEffect, useRef } from 'react';
import { areNotificationsEnabled, showNotification, setNotificationLocale } from '@/lib/notifications';
import { parseTimeToDate } from '@/lib/prayer';
import { useLocale } from 'next-intl';

const NOTIFICATION_STRINGS = {
  tr: {
    fajrTitle: (m: number) => (m === 0 ? 'Sahur Vakti!' : `${m} dakika kaldı`),
    fajrBody: (m: number) => (m === 0 ? 'Sahur vakti geldi' : `${m} dakika sonra Sahur vakti`),
    maghribTitle: (m: number) => (m === 0 ? 'İftar Vakti!' : `${m} dakika kaldı`),
    maghribBody: (m: number) => (m === 0 ? 'İftar vakti geldi' : `${m} dakika sonra İftar vakti`),
  },
  en: {
    fajrTitle: (m: number) => (m === 0 ? 'Suhoor Time!' : `${m} min remaining`),
    fajrBody: (m: number) => (m === 0 ? 'Suhoor time has started' : `${m} minutes until Suhoor`),
    maghribTitle: (m: number) => (m === 0 ? 'Iftar Time!' : `${m} min remaining`),
    maghribBody: (m: number) => (m === 0 ? 'Iftar time has started' : `${m} minutes until Iftar`),
  },
};

function isSafariOrIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iOS standalone mode (PWA added to home screen)
  const isStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  return (
    isStandalone ||
    /^((?!chrome|android).)*safari/i.test(ua) ||
    /iPhone|iPad|iPod/.test(ua) ||
    (ua.includes('Safari') && !ua.includes('Chrome'))
  );
}

/**
 * Client-side notification scheduler for Safari/iOS.
 * Safari/iOS does not run Service Workers in background (even in standalone/PWA mode),
 * so we schedule timeouts while the app is open.
 * Chrome/Edge/Firefox use the Service Worker for background reminders.
 */
export function NotificationManager() {
  const scheduledRef = useRef<Set<number>>(new Set());
  const locale = useLocale() as 'tr' | 'en';

  useEffect(() => {
    setNotificationLocale(locale);
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!areNotificationsEnabled()) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!isSafariOrIOS()) return;

    const scheduled = scheduledRef.current;
    const strings = NOTIFICATION_STRINGS[locale];

    const scheduleNotifications = async () => {
      try {
        const res = await fetch('/api/timings');
        if (!res.ok) return;
        const data = await res.json();
        const timings = data?.data?.timings;
        if (!timings?.Fajr || !timings?.Maghrib) return;

        const fajrTime = parseTimeToDate(timings.Fajr);
        const maghribTime = parseTimeToDate(timings.Maghrib);
        const now = new Date();

        scheduled.forEach((id) => clearTimeout(id));
        scheduled.clear();

        const reminders = [
          ...([15, 10, 5, 0].map((minutes) => ({
            time: new Date(fajrTime.getTime() - minutes * 60 * 1000),
            minutes,
            type: 'fajr' as const,
          }))),
          ...([15, 10, 5, 0].map((minutes) => ({
            time: new Date(maghribTime.getTime() - minutes * 60 * 1000),
            minutes,
            type: 'maghrib' as const,
          }))),
        ];

        reminders.forEach(({ time, minutes, type }) => {
          const delay = time.getTime() - now.getTime();
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            const timeoutId = window.setTimeout(() => {
              if (!('Notification' in window) || Notification.permission !== 'granted') return;
              const isFajr = type === 'fajr';
              const title = isFajr ? strings.fajrTitle(minutes) : strings.maghribTitle(minutes);
              const body = isFajr ? strings.fajrBody(minutes) : strings.maghribBody(minutes);
              showNotification(title, { body, tag: `safari-${type}-${minutes}-${Date.now()}` });
            }, delay);
            scheduled.add(timeoutId);
          }
        });
      } catch (error) {
        console.error('Error scheduling notifications:', error);
      }
    };

    scheduleNotifications();
    const interval = setInterval(scheduleNotifications, 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      scheduled.forEach((id) => clearTimeout(id));
      scheduled.clear();
    };
  }, [locale]);

  return null;
}
