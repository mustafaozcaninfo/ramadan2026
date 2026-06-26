import { Serwist, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { PUSH_FALLBACK_COPY } from '@/lib/notificationCopy';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

let notificationLocaleCache: 'tr' | 'en' | 'ar' | null = null;

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

// Background reminders are delivered via server Web Push (cron + Redis).
// Safari/iOS foreground scheduling lives in NotificationManager while the app is open.
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      const locale = await getNotificationLocale();
      const fallback = PUSH_FALLBACK_COPY[locale];
      let title = fallback.title;
      let body = fallback.body;

      if (event.data) {
        try {
          const data = event.data.json();
          title = data?.title ?? title;
          body = data?.body ?? body;
        } catch {
          // use fallback
        }
      }

      await self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'prayer-push',
        requireInteraction: false,
      });
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'NOTIFICATION_SETTINGS_CHANGED') {
    if (event.data.locale === 'en' || event.data.locale === 'tr' || event.data.locale === 'ar') {
      notificationLocaleCache = event.data.locale;
    }
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
