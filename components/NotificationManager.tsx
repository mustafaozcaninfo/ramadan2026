'use client';

import { useEffect, useRef } from 'react';
import {
  areNotificationsEnabled,
  showNotification,
  setNotificationLocale,
  subscribeToPush,
  normalizeNotificationLocale,
} from '@/lib/notifications';
import { useLocale } from 'next-intl';
import { useAppStore } from '@/lib/store/useAppStore';
import { SUPPORTED_CITIES } from '@/lib/prayer';

type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const PRAYER_NAMES: Record<'tr' | 'en' | 'ar', Record<PrayerKey, string>> = {
  tr: {
    Fajr: 'İmsak',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı',
  },
  en: {
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
  },
  ar: {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  },
};

const PRAYER_ORDER: PrayerKey[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function safariStrings(locale: 'tr' | 'en' | 'ar', key: PrayerKey, minutes: number) {
  const name = PRAYER_NAMES[locale][key];
  if (locale === 'tr') {
    return minutes === 0
      ? { title: `${name} vakti`, body: `${name} vakti girdi` }
      : { title: `${minutes} dakika kaldı`, body: `${minutes} dakika sonra ${name}` };
  }
  if (locale === 'ar') {
    return minutes === 0
      ? { title: `وَقت ${name}`, body: `دخل وَقت ${name}` }
      : { title: `متبقي ${minutes} دقيقة`, body: `متبقي ${minutes} دقيقة على ${name}` };
  }
  return minutes === 0
    ? { title: `${name} time`, body: `${name} time has started` }
    : { title: `${minutes} min left`, body: `${minutes} minutes until ${name}` };
}

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

function getCityDateParts(timeZone: string, d: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '1');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '1');
  return { year, month, day };
}

function getOffsetMsAtTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '1');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '1');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const second = Number(parts.find((p) => p.type === 'second')?.value ?? '0');
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return asUtc - date.getTime();
}

function cityDateTimeToDate(timeZone: string, year: number, month: number, day: number, hh: number, mm: number): Date {
  // Convert "city local datetime" -> actual Date (UTC) by solving timezone offset.
  let utcMs = Date.UTC(year, month - 1, day, hh, mm, 0);
  for (let i = 0; i < 2; i++) {
    const offsetMs = getOffsetMsAtTimeZone(new Date(utcMs), timeZone);
    utcMs = Date.UTC(year, month - 1, day, hh, mm, 0) - offsetMs;
  }
  return new Date(utcMs);
}

function parseTimeInCity(timeStr: string, timeZone: string): Date {
  const [hh, mm] = timeStr.split(':').map(Number);
  const { year, month, day } = getCityDateParts(timeZone);
  return cityDateTimeToDate(timeZone, year, month, day, hh ?? 0, mm ?? 0);
}

/**
 * Client-side notification scheduler for Safari/iOS.
 * Safari/iOS does not run Service Workers in background (even in standalone/PWA mode),
 * so we schedule timeouts while the app is open.
 * Chrome/Edge/Firefox use the Service Worker for background reminders.
 */
export function NotificationManager() {
  const scheduledRef = useRef<Set<number>>(new Set());
  const locale = useLocale() as 'tr' | 'en' | 'ar';
  const normalizedLocale = normalizeNotificationLocale(locale);
  const reminderIntervals = useAppStore((s) => s.reminderIntervals);
  const city = useAppStore((s) => s.city);
  const cityConfig = SUPPORTED_CITIES.find((c) => c.city === city) ?? SUPPORTED_CITIES[0];

  useEffect(() => {
    setNotificationLocale(normalizedLocale);
  }, [normalizedLocale]);

  // Re-subscribe with updated reminderIntervals when they change (updates Redis)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!areNotificationsEnabled()) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const intervals = reminderIntervals.length ? reminderIntervals : [15, 10, 5, 0];
    void subscribeToPush(normalizedLocale, intervals);
  }, [reminderIntervals, normalizedLocale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!areNotificationsEnabled()) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!isSafariOrIOS()) return;

    const scheduled = scheduledRef.current;
    const intervals = reminderIntervals.length ? reminderIntervals : [0];

    const scheduleNotifications = async () => {
      try {
        const res = await fetch(
          `/api/timings?city=${encodeURIComponent(cityConfig.city)}&country=${encodeURIComponent(cityConfig.country)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const timings = data?.data?.timings;
        if (!timings?.Fajr || !timings?.Maghrib) return;

        const cityTz = cityConfig.timezone ?? 'Asia/Qatar';
        const now = new Date();

        scheduled.forEach((id) => clearTimeout(id));
        scheduled.clear();

        const reminders: Array<{ time: Date; minutes: number; prayerKey: PrayerKey }> = [];

        for (const prayerKey of PRAYER_ORDER) {
          const timeStr = timings[prayerKey];
          if (!timeStr) continue;
          const prayerInstant = parseTimeInCity(timeStr, cityTz);
          for (const minutes of intervals) {
            reminders.push({
              time: new Date(prayerInstant.getTime() - minutes * 60 * 1000),
              minutes,
              prayerKey,
            });
          }
        }

        reminders.forEach(({ time, minutes, prayerKey }) => {
          const delay = time.getTime() - now.getTime();
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            const timeoutId = window.setTimeout(() => {
              if (!('Notification' in window) || Notification.permission !== 'granted') return;
              const { title, body } = safariStrings(normalizedLocale, prayerKey, minutes);
              showNotification(title, { body, tag: `safari-${prayerKey}-${minutes}-${Date.now()}` });
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
  }, [normalizedLocale, reminderIntervals, cityConfig.city, cityConfig.country, cityConfig.timezone]);

  return null;
}
