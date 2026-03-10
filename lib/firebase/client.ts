'use client';

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  type User,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  type Firestore,
} from 'firebase/firestore';
import type { AppUser } from '@/lib/store/useAppStore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!isConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!isConfigured()) return null;
  if (!app) getFirebaseAuth();
  if (!db && app) db = getFirestore(app);
  return db;
}

export function toAppUser(user: User): AppUser {
  return { uid: user.uid, email: user.email ?? null };
}

export async function signInWithGoogle(): Promise<AppUser | null> {
  const a = getFirebaseAuth();
  if (!a) return null;
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(a, provider);
  return toAppUser(result.user);
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AppUser | null> {
  const a = getFirebaseAuth();
  if (!a) return null;
  try {
    const result = await signInWithEmailAndPassword(a, email, password);
    return toAppUser(result.user);
  } catch {
    return null;
  }
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<AppUser | null> {
  const a = getFirebaseAuth();
  if (!a) return null;
  try {
    const result = await createUserWithEmailAndPassword(a, email, password);
    return toAppUser(result.user);
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  const a = getFirebaseAuth();
  if (a) await firebaseSignOut(a);
}

export function subscribeToAuth(callback: (user: AppUser | null) => void): () => void {
  const a = getFirebaseAuth();
  if (!a) {
    callback(null);
    return () => {};
  }
  const unsubscribe = onAuthStateChanged(a, (user) => {
    callback(user ? toAppUser(user) : null);
  });
  return unsubscribe;
}

export async function getIdToken(): Promise<string | null> {
  const a = getFirebaseAuth();
  if (!a?.currentUser) return null;
  return a.currentUser.getIdToken();
}

const SETTINGS_COLLECTION = 'users';
const SETTINGS_DOC = 'settings';

export interface UserSettingsDoc {
  notificationsEnabled?: boolean;
  reminderIntervals?: number[];
  city?: string;
  locale?: string;
  liveAutoplay?: boolean;
  resourcePreferences?: {
    favoriteResourceIds?: string[];
    recentlyViewed?: string[];
    resourcesSearch?: string;
    resourcesFilters?: {
      category?: string;
      subcategory?: string;
      type?: 'zikir' | 'tesbihat' | 'dua' | 'salawat' | 'wird';
      difficulty?: 'easy' | 'medium' | 'advanced';
      timing?: 'after_fajr' | 'after_maghrib' | 'morning_evening' | 'anytime';
      language?: 'tr' | 'en' | 'ar';
    };
  };
  updatedAt?: string;
}

export async function saveUserSettings(
  uid: string,
  data: Partial<UserSettingsDoc>
): Promise<boolean> {
  const firestore = getFirebaseDb();
  if (!firestore) return false;
  try {
    const ref = doc(firestore, SETTINGS_COLLECTION, uid, SETTINGS_DOC, 'prefs');
    await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

export async function loadUserSettings(uid: string): Promise<UserSettingsDoc | null> {
  const firestore = getFirebaseDb();
  if (!firestore) return null;
  try {
    const ref = doc(firestore, SETTINGS_COLLECTION, uid, SETTINGS_DOC, 'prefs');
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserSettingsDoc) : null;
  } catch {
    return null;
  }
}

export function isFirebaseEnabled(): boolean {
  return isConfigured();
}
