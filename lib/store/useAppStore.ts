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
const MAX_RECENTLY_VIEWED = 30;

export interface ResourceFilters {
  category?: string;
  subcategory?: string;
  type?: 'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird';
  difficulty?: 'easy' | 'medium' | 'advanced';
  timing?: 'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime';
  language?: LocaleCode;
}

export interface AppState {
  user: AppUser | null;
  city: string;
  reminderIntervals: number[];
  notificationsEnabled: boolean;
  liveAutoplay: boolean;
  resourcesFilters: ResourceFilters;
  resourcesSearch: string;
  favoriteResourceIds: string[];
  recentlyViewed: string[];
  setUser: (user: AppUser | null) => void;
  setCity: (city: string) => void;
  setReminderIntervals: (intervals: number[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLiveAutoplay: (enabled: boolean) => void;
  toggleReminderInterval: (minutes: number) => void;
  setResourcesFilters: (filters: Partial<ResourceFilters>) => void;
  resetResourcesFilters: () => void;
  setResourcesSearch: (search: string) => void;
  setFavoriteResourceIds: (ids: string[]) => void;
  setRecentlyViewed: (slugs: string[]) => void;
  toggleFavoriteResourceId: (id: string) => void;
  addRecentlyViewed: (slug: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      city: 'Doha',
      reminderIntervals: DEFAULT_REMINDER_INTERVALS,
      notificationsEnabled: false,
      liveAutoplay: false,
      resourcesFilters: { language: 'tr' },
      resourcesSearch: '',
      favoriteResourceIds: [],
      recentlyViewed: [],

      setUser: (user) => set({ user }),

      setCity: (city) => set({ city }),

      setReminderIntervals: (intervals) => set({ reminderIntervals: intervals }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      setLiveAutoplay: (enabled) => set({ liveAutoplay: enabled }),

      toggleReminderInterval: (minutes) =>
        set((state) => {
          const has = state.reminderIntervals.includes(minutes);
          const next = has
            ? state.reminderIntervals.filter((m) => m !== minutes)
            : [...state.reminderIntervals, minutes].sort((a, b) => b - a);
          return { reminderIntervals: next.length ? next : [0] };
        }),

      setResourcesFilters: (filters) =>
        set((state) => ({
          resourcesFilters: {
            ...state.resourcesFilters,
            ...filters,
          },
        })),

      resetResourcesFilters: () =>
        set({
          resourcesFilters: { language: 'tr' },
        }),

      setResourcesSearch: (search) => set({ resourcesSearch: search }),

      setFavoriteResourceIds: (ids) =>
        set({
          favoriteResourceIds: Array.from(new Set(ids.filter(Boolean))),
        }),

      setRecentlyViewed: (slugs) =>
        set({
          recentlyViewed: Array.from(new Set(slugs.filter(Boolean))).slice(0, MAX_RECENTLY_VIEWED),
        }),

      toggleFavoriteResourceId: (id) =>
        set((state) => {
          const has = state.favoriteResourceIds.includes(id);
          return {
            favoriteResourceIds: has
              ? state.favoriteResourceIds.filter((v) => v !== id)
              : [...state.favoriteResourceIds, id],
          };
        }),

      addRecentlyViewed: (slug) =>
        set((state) => {
          const deduped = [slug, ...state.recentlyViewed.filter((s) => s !== slug)];
          return {
            recentlyViewed: deduped.slice(0, MAX_RECENTLY_VIEWED),
          };
        }),
    }),
    { name: STORAGE_KEY }
  )
);
