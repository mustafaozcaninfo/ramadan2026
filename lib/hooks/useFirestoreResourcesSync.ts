'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { isFirebaseEnabled, loadUserSettings, saveUserSettings } from '@/lib/firebase/client';

/**
 * Sync Resources preferences with Firestore when the user is authenticated.
 */
export function useFirestoreResourcesSync() {
  const user = useAppStore((s) => s.user);
  const resourcesFilters = useAppStore((s) => s.resourcesFilters);
  const resourcesSearch = useAppStore((s) => s.resourcesSearch);
  const favoriteResourceIds = useAppStore((s) => s.favoriteResourceIds);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);

  const setResourcesFilters = useAppStore((s) => s.setResourcesFilters);
  const setResourcesSearch = useAppStore((s) => s.setResourcesSearch);
  const setFavoriteResourceIds = useAppStore((s) => s.setFavoriteResourceIds);
  const setRecentlyViewed = useAppStore((s) => s.setRecentlyViewed);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseEnabled() || !user?.uid) {
      loadedRef.current = false;
      return;
    }

    let cancelled = false;

    loadUserSettings(user.uid).then((data) => {
      if (cancelled) return;

      const prefs = data?.resourcePreferences;
      if (prefs) {
        if (Array.isArray(prefs.favoriteResourceIds)) {
          setFavoriteResourceIds(prefs.favoriteResourceIds);
        }
        if (Array.isArray(prefs.recentlyViewed)) {
          setRecentlyViewed(prefs.recentlyViewed);
        }
        if (typeof prefs.resourcesSearch === 'string') {
          setResourcesSearch(prefs.resourcesSearch);
        }
        if (prefs.resourcesFilters && typeof prefs.resourcesFilters === 'object') {
          setResourcesFilters(prefs.resourcesFilters);
        }
      }

      loadedRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [
    user?.uid,
    setFavoriteResourceIds,
    setRecentlyViewed,
    setResourcesSearch,
    setResourcesFilters,
  ]);

  useEffect(() => {
    if (!isFirebaseEnabled() || !user?.uid || !loadedRef.current) return;

    const timer = setTimeout(() => {
      void saveUserSettings(user.uid, {
        resourcePreferences: {
          favoriteResourceIds,
          recentlyViewed,
          resourcesSearch,
          resourcesFilters,
        },
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    user?.uid,
    favoriteResourceIds,
    recentlyViewed,
    resourcesSearch,
    resourcesFilters,
  ]);
}
