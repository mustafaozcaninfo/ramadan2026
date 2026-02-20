/**
 * Browser notification utilities for Sahur and Iftar reminders
 */

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return { granted: false, denied: false, default: false };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, denied: false, default: false };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, denied: true, default: false };
  }

  const permission = await Notification.requestPermission();
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
}

/**
 * Show notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  return new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ramadan-reminder',
    requireInteraction: false,
    ...options,
  });
}

/**
 * Schedule notification for a specific time
 */
export function scheduleNotification(
  targetTime: Date,
  title: string,
  body: string,
  minutesBefore: number[] = [15, 10, 5, 0]
): void {
  const now = new Date();
  const timeDiff = targetTime.getTime() - now.getTime();

  minutesBefore.forEach((minutes) => {
    const notificationTime = timeDiff - minutes * 60 * 1000;

    if (notificationTime > 0) {
      setTimeout(() => {
        showNotification(title, {
          body: minutes === 0 ? body : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} remaining`,
        });
      }, notificationTime);
    }
  });
}

/**
 * Check if notifications are enabled in localStorage
 */
export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ramadan-notifications-enabled') === 'true';
}

/**
 * Subscribe to Web Push and register with backend (for iOS 16.4+ PWA and others).
 * Call after notification permission is granted.
 */
export async function subscribeToPush(locale: 'tr' | 'en'): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    const subscription = sub ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
    });
    const res = await fetch('/api/push-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        locale,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, '+').replace(/_/g, '/') + padding);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Enable notifications and optionally set locale for notification text
 */
export function enableNotifications(locale?: 'tr' | 'en'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ramadan-notifications-enabled', 'true');
  syncNotificationSettingsToSW(true, locale);
  postMessageToSW({ type: 'NOTIFICATION_SETTINGS_CHANGED', enabled: true, locale });
  if (locale) void subscribeToPush(locale);
}

/**
 * Disable notifications
 */
export function disableNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ramadan-notifications-enabled', 'false');
  syncNotificationSettingsToSW(false);
  postMessageToSW({ type: 'NOTIFICATION_SETTINGS_CHANGED', enabled: false });
}

/**
 * Set locale for notification text (TR/EN). Persists to IndexedDB and notifies SW.
 */
export function setNotificationLocale(locale: 'tr' | 'en'): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  const request = indexedDB.open('ramadan-app', 1);
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings');
    }
  };
  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(locale, 'notificationLocale');
  };
  postMessageToSW({ type: 'NOTIFICATION_SETTINGS_CHANGED', enabled: areNotificationsEnabled(), locale });
}

function postMessageToSW(msg: { type: string; enabled?: boolean; locale?: 'tr' | 'en' }): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  }
}

/**
 * Sync notification settings to Service Worker via IndexedDB
 */
function syncNotificationSettingsToSW(enabled: boolean, locale?: 'tr' | 'en'): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  const request = indexedDB.open('ramadan-app', 1);
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings');
    }
  };
  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    store.put(enabled, 'notificationsEnabled');
    if (locale) store.put(locale, 'notificationLocale');
  };
}
