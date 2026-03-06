'use client';

/**
 * Analytics helpers. Uses Vercel Analytics when available; no-op otherwise.
 * All data is anonymous; see privacy policy in About.
 */

import { track as vercelTrack } from '@vercel/analytics';

export type AnalyticsEventName =
  | 'azan_click'
  | 'notification_enabled'
  | 'calendar_today_click'
  | 'live_channel_select'
  | 'settings_language_change';

export function trackEvent(name: AnalyticsEventName, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  try {
    vercelTrack(name, props);
  } catch {
    // ignore
  }
}
