'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  loadUserSettings,
  saveUserSettings,
  isFirebaseEnabled,
} from '@/lib/firebase/client';
import {
  enableNotifications,
  disableNotifications,
} from '@/lib/notifications';

/**
 * When user is logged in, syncs settings between Firestore and local store/localStorage.
 * - On user present: load from Firestore and apply to store + localStorage.
 * - On store.notificationsEnabled or reminderIntervals change (with user): save to Firestore.
 */
export function useFirestoreSettingsSync(locale: string) {
  const user = useAppStore((s) => s.user);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const reminderIntervals = useAppStore((s) => s.reminderIntervals);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const setReminderIntervals = useAppStore((s) => s.setReminderIntervals);
  const loadedRef = useRef(false);

  // Load from Firestore when user appears
  useEffect(() => {
    if (!isFirebaseEnabled() || !user?.uid) {
      loadedRef.current = false;
      return;
    }
    let cancelled = false;
    loadUserSettings(user.uid).then((data) => {
      if (cancelled) return;
      if (data) {
        if (Array.isArray(data.reminderIntervals) && data.reminderIntervals.length) {
          setReminderIntervals(data.reminderIntervals);
        }
        if (typeof data.notificationsEnabled === 'boolean') {
          setNotificationsEnabled(data.notificationsEnabled);
          if (data.notificationsEnabled) {
            const intervals = Array.isArray(data.reminderIntervals) && data.reminderIntervals.length
              ? data.reminderIntervals
              : undefined;
            enableNotifications(locale as 'tr' | 'en', intervals);
          } else {
            disableNotifications();
          }
        }
      }
      loadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid, setNotificationsEnabled, setReminderIntervals, locale]);

  // Persist to Firestore when user is set and store changes (debounced)
  useEffect(() => {
    if (!isFirebaseEnabled() || !user?.uid || !loadedRef.current) return;
    const t = setTimeout(() => {
      saveUserSettings(user.uid, {
        notificationsEnabled,
        reminderIntervals,
      });
    }, 500);
    return () => clearTimeout(t);
  }, [user?.uid, notificationsEnabled, reminderIntervals]);
}
