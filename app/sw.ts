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
let notificationLocaleCache: 'tr' | 'en' | 'ar' | null = null;

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
      const request = indexedDB.open('prayer-app', 1);
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
async function getNotificationLocale(): Promise<'tr' | 'en' | 'ar'> {
  if (notificationLocaleCache !== null) return notificationLocaleCache;
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('prayer-app', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };
    });
    const locale = await new Promise<'tr' | 'en' | 'ar'>((resolve) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('notificationLocale');
      request.onsuccess = () => {
        const v = request.result;
        db.close();
        resolve(v === 'en' ? 'en' : v === 'ar' ? 'ar' : 'tr');
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

type SwPrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const SW_PRAYER_ORDER: SwPrayerKey[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const SW_PRAYER_NAMES: Record<'tr' | 'en' | 'ar', Record<SwPrayerKey, string>> = {
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

function swNotificationCopy(
  locale: 'tr' | 'en' | 'ar',
  key: SwPrayerKey,
  minutes: number
): { title: string; body: string } {
  const name = SW_PRAYER_NAMES[locale][key];
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

/**
 * Get today's prayer times from same-origin API (Doha date, same data as app)
 */
async function getTodayPrayerTimes(): Promise<Partial<Record<SwPrayerKey, string>> | null> {
  const dohaDate = getDohaDateString();
  const url = `${self.location.origin}/api/timings?date=${dohaDate}`;
  try {
    const cache = await caches.open('prayer-timings-cache');
    const cached = await cache.match(url);
    if (cached) {
      const data = await cached.json();
      const t = data?.data?.timings;
      if (t?.Fajr && t?.Maghrib) return t;
    }
    const response = await fetch(url);
    if (response.ok) {
      const clone = response.clone();
      const data = await response.json();
      const t = data?.data?.timings;
      if (t?.Fajr && t?.Maghrib) {
        cache.put(url, clone);
        return t;
      }
    }
  } catch (error) {
    console.error('Error fetching prayer times in SW:', error);
  }
  return null;
}

/**
 * Check and send notifications for prayer times
 */
async function checkAndSendNotifications(): Promise<void> {
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) return;

    const locale = await getNotificationLocale();
    const prayerTimes = await getTodayPrayerTimes();
    if (!prayerTimes) return;

    const now = new Date();
    const dateKey = getDohaDateString();
    const reminderMinutes = [15, 10, 5, 0];

    for (const key of SW_PRAYER_ORDER) {
      const timeStr = prayerTimes[key];
      if (!timeStr) continue;
      const prayerInstant = parseTimeToDate(timeStr);
      for (const minutes of reminderMinutes) {
        const reminderTime = new Date(prayerInstant.getTime() - minutes * 60 * 1000);
        const timeDiff = reminderTime.getTime() - now.getTime();
        const notificationKey = `${key.toLowerCase()}-${minutes}-${dateKey}`;

        if (timeDiff >= 0 && timeDiff < 60 * 1000 && !lastNotificationTimes.has(notificationKey)) {
          const { title, body } = swNotificationCopy(locale, key, minutes);
          await self.registration.showNotification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: notificationKey,
            requireInteraction: false,
          });
          lastNotificationTimes.add(notificationKey);
        }
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
    const fallbackByLocale = {
      tr: { title: 'Namaz Vakitleri', body: 'Hatırlatıcı' },
      en: { title: 'Prayer Times', body: 'Reminder' },
      ar: { title: 'مواقيت الصلاة', body: 'تذكير' },
    } as const;
    const locale = notificationLocaleCache === 'en' ? 'en' : notificationLocaleCache === 'ar' ? 'ar' : 'tr';
    const title = data?.title ?? fallbackByLocale[locale].title;
    const body = data?.body ?? '';
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'prayer-push',
        requireInteraction: false,
      })
    );
  } catch {
    const fallbackByLocale = {
      tr: { title: 'Namaz Vakitleri', body: 'Hatırlatıcı' },
      en: { title: 'Prayer Times', body: 'Reminder' },
      ar: { title: 'مواقيت الصلاة', body: 'تذكير' },
    } as const;
    const locale = notificationLocaleCache === 'en' ? 'en' : notificationLocaleCache === 'ar' ? 'ar' : 'tr';
    event.waitUntil(
      self.registration.showNotification(fallbackByLocale[locale].title, {
        body: fallbackByLocale[locale].body,
        icon: '/icon-192.png',
        tag: 'prayer-push',
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
    if (event.data.locale === 'en' || event.data.locale === 'tr' || event.data.locale === 'ar') {
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
