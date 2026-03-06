'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LocaleCode = 'tr' | 'en' | 'ar';

export interface AppUser {
  uid: string;
  email: string | null;
}

const DEFAULT_REMINDER_INTERVALS = [15, 10, 5, 0];
const STORAGE_KEY = 'ramadan-app-settings';

export interface AppState {
  user: AppUser | null;
  city: string;
  reminderIntervals: number[];
  notificationsEnabled: boolean;
  setUser: (user: AppUser | null) => void;
  setCity: (city: string) => void;
  setReminderIntervals: (intervals: number[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleReminderInterval: (minutes: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      city: 'Doha',
      reminderIntervals: DEFAULT_REMINDER_INTERVALS,
      notificationsEnabled: false,

      setUser: (user) => set({ user }),

      setCity: (city) => set({ city }),

      setReminderIntervals: (intervals) => set({ reminderIntervals: intervals }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      toggleReminderInterval: (minutes) =>
        set((state) => {
          const has = state.reminderIntervals.includes(minutes);
          const next = has
            ? state.reminderIntervals.filter((m) => m !== minutes)
            : [...state.reminderIntervals, minutes].sort((a, b) => b - a);
          return { reminderIntervals: next.length ? next : [0] };
        }),
    }),
    { name: STORAGE_KEY }
  )
);
