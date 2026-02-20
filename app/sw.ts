import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Notification state
let notificationCheckInterval: number | null = null;
let lastNotificationTimes: Set<string> = new Set();
let notificationsEnabledCache: boolean | null = null;
let notificationLocaleCache: 'tr' | 'en' | null = null;

/** Today's date in Doha (YYYY-MM-DD) for correct day */
function getDohaDateString(): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Doha' });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Parse time string (HH:mm) to Date object for today
 */
function parseTimeToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target.getTime() < now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

/**
 * Check if notifications are enabled (from IndexedDB). Default OFF until user enables.
 */
async function areNotificationsEnabled(): Promise<boolean> {
  if (notificationsEnabledCache !== null) return notificationsEnabledCache;
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('ramadan-app', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };
    });
    const enabled = await new Promise<boolean>((resolve) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('notificationsEnabled');
      request.onsuccess = () => {
        const result = request.result === true;
        db.close();
        resolve(result);
      };
      request.onerror = () => {
        db.close();
        resolve(false);
      };
    });
    notificationsEnabledCache = enabled;
    return enabled;
  } catch {
    notificationsEnabledCache = false;
    return false;
  }
}

/**
 * Get notification locale from IndexedDB (default 'tr')
 */
async function getNotificationLocale(): Promise<'tr' | 'en'> {
  if (notificationLocaleCache !== null) return notificationLocaleCache;
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('ramadan-app', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };
    });
    const locale = await new Promise<'tr' | 'en'>((resolve) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('notificationLocale');
      request.onsuccess = () => {
        const v = request.result;
        db.close();
        resolve(v === 'en' ? 'en' : 'tr');
      };
      request.onerror = () => {
        db.close();
        resolve('tr');
      };
    });
    notificationLocaleCache = locale;
    return locale;
  } catch {
    return 'tr';
  }
}

/**
 * Get today's prayer times from same-origin API (Doha date, same data as app)
 */
async function getTodayPrayerTimes(): Promise<{ Fajr: string; Maghrib: string } | null> {
  const dohaDate = getDohaDateString();
  const url = `${self.location.origin}/api/timings?date=${dohaDate}`;
  try {
    const cache = await caches.open('ramadan-timings-cache');
    const cached = await cache.match(url);
    if (cached) {
      const data = await cached.json();
      const t = data?.data?.timings;
      if (t?.Fajr && t?.Maghrib) return { Fajr: t.Fajr, Maghrib: t.Maghrib };
    }
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const t = data?.data?.timings;
      if (t?.Fajr && t?.Maghrib) {
        const clone = response.clone();
        cache.put(url, clone);
        return { Fajr: t.Fajr, Maghrib: t.Maghrib };
      }
    }
  } catch (error) {
    console.error('Error fetching prayer times in SW:', error);
  }
  return null;
}


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

/**
 * Check and send notifications for prayer times
 */
async function checkAndSendNotifications(): Promise<void> {
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    const locale = await getNotificationLocale();
    const strings = NOTIFICATION_STRINGS[locale];
    const prayerTimes = await getTodayPrayerTimes();
    if (!prayerTimes) return;

    const now = new Date();
    const fajrTime = parseTimeToDate(prayerTimes.Fajr);
    const maghribTime = parseTimeToDate(prayerTimes.Maghrib);
    const dateKey = getDohaDateString();

    const fajrReminders = [15, 10, 5, 0];
    for (const minutes of fajrReminders) {
      const reminderTime = new Date(fajrTime.getTime() - minutes * 60 * 1000);
      const timeDiff = reminderTime.getTime() - now.getTime();
      const notificationKey = `fajr-${minutes}-${dateKey}`;

      if (timeDiff >= 0 && timeDiff < 60 * 1000 && !lastNotificationTimes.has(notificationKey)) {
        await self.registration.showNotification(strings.fajrTitle(minutes), {
          body: strings.fajrBody(minutes),
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: notificationKey,
          requireInteraction: false,
        });
        lastNotificationTimes.add(notificationKey);
      }
    }

    const maghribReminders = [15, 10, 5, 0];
    for (const minutes of maghribReminders) {
      const reminderTime = new Date(maghribTime.getTime() - minutes * 60 * 1000);
      const timeDiff = reminderTime.getTime() - now.getTime();
      const notificationKey = `maghrib-${minutes}-${dateKey}`;

      if (timeDiff >= 0 && timeDiff < 60 * 1000 && !lastNotificationTimes.has(notificationKey)) {
        await self.registration.showNotification(strings.maghribTitle(minutes), {
          body: strings.maghribBody(minutes),
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: notificationKey,
          requireInteraction: false,
        });
        lastNotificationTimes.add(notificationKey);
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    lastNotificationTimes.forEach((key) => {
      if (key.includes(yesterdayStr)) lastNotificationTimes.delete(key);
    });
  } catch (error) {
    console.error('Error in notification check:', error);
  }
}

/**
 * Start notification checking interval
 */
function startNotificationChecker(): void {
  // Clear existing interval
  if (notificationCheckInterval !== null) {
    clearInterval(notificationCheckInterval);
  }

  // Check immediately
  checkAndSendNotifications();

  // Then check every minute
  notificationCheckInterval = setInterval(() => {
    checkAndSendNotifications();
  }, 60 * 1000) as unknown as number;
}

/**
 * Stop notification checking interval
 */
function stopNotificationChecker(): void {
  if (notificationCheckInterval !== null) {
    clearInterval(notificationCheckInterval);
    notificationCheckInterval = null;
  }
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.href.startsWith('https://api.aladhan.com/'),
      handler: new NetworkFirst({
        cacheName: 'aladhan-api-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response?.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
    {
      matcher: ({ url }) => url.href.startsWith('https://fonts.googleapis.com/') || url.href.startsWith('https://fonts.gstatic.com/'),
      handler: new CacheFirst({
        cacheName: 'google-fonts-cache',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-font-assets',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-image-assets',
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/image'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-image',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:mp3|wav|ogg)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'static-audio-assets',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:mp4)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'static-video-assets',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:js)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-js-assets',
      }),
    },
    {
      matcher: ({ url }) => /\.(?:css|less)$/i.test(url.pathname),
      handler: new StaleWhileRevalidate({
        cacheName: 'static-style-assets',
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/data/'),
      handler: new StaleWhileRevalidate({
        cacheName: 'next-data',
      }),
    },
    {
      matcher: ({ url }) => {
        const isSameOrigin = self.location.origin === url.origin;
        if (!isSameOrigin) return false;
        const pathname = url.pathname;
        if (pathname.startsWith('/api/auth')) return false;
        if (pathname.startsWith('/api/webhook')) return false;
        if (pathname.startsWith('/api/health')) return false;
        if (pathname.startsWith('/api/status')) return false;
        return true;
      },
      handler: new NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
      }),
    },
  ],
});

serwist.addEventListeners();

// Web Push: server-sent notifications (iOS 16.4+ PWA, Chrome, etc.)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data?.title ?? 'Ramadan 2026';
    const body = data?.body ?? '';
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'ramadan-push',
        requireInteraction: false,
      })
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('Ramadan 2026', {
        body: 'Hatırlatıcı',
        icon: '/icon-192.png',
        tag: 'ramadan-push',
      })
    );
  }
});

// Handle Service Worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // Start notification checker when Service Worker activates
      startNotificationChecker();
    })
  );
});

// Handle Service Worker installation
self.addEventListener('install', (event) => {
  // Start notification checker immediately
  startNotificationChecker();
});

// Handle messages from client (for notification settings + locale)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'NOTIFICATION_SETTINGS_CHANGED') {
    notificationsEnabledCache = event.data.enabled !== false;
    if (event.data.locale === 'en' || event.data.locale === 'tr') {
      notificationLocaleCache = event.data.locale;
    }
    startNotificationChecker();
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Start notification checker when Service Worker loads
startNotificationChecker();
