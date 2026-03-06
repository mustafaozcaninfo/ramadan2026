'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Mail } from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  signOut,
  subscribeToAuth,
  isFirebaseEnabled,
} from '@/lib/firebase/client';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function AuthSection() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const { user, setUser } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((u) => setUser(u));
    return unsubscribe;
  }, [setUser]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseEnabled()) {
      toast.error('Firebase is not configured.');
      return;
    }
    setLoading(true);
    try {
      const appUser = await signInWithGoogle();
      if (appUser) {
        setUser(appUser);
        toast.success(tCommon('language') ? 'Signed in' : 'Giriş yapıldı');
      }
    } catch (e) {
      toast.error('Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (!isFirebaseEnabled()) {
      toast.error('Firebase is not configured.');
      return;
    }
    setLoading(true);
    try {
      const appUser = isRegister
        ? await registerWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (appUser) {
        setUser(appUser);
        toast.success(isRegister ? 'Account created' : 'Signed in');
      } else {
        toast.error('Invalid email or password.');
      }
    } catch {
      toast.error('Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      toast.success('Signed out');
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseEnabled()) {
    return (
      <p className="text-xs text-slate-400">
        Sign-in is disabled. Set NEXT_PUBLIC_FIREBASE_* env to enable.
      </p>
    );
  }

  if (user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-200">
          {user.email ?? 'Signed in'}
        </p>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
          disabled={loading}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full"
        disabled={loading}
        aria-label="Sign in with Google"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign in with Google
      </Button>

      <form onSubmit={handleEmailSubmit} className="space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ramadan-green"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ramadan-green"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="default"
            className="flex-1"
            disabled={loading || !email.trim() || !password}
          >
            <Mail className="w-4 h-4 mr-2" />
            {isRegister ? 'Register' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRegister((v) => !v)}
          >
            {isRegister ? 'Sign in' : 'Register'}
          </Button>
        </div>
      </form>
    </div>
  );
}
