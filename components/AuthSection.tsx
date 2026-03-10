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
  const tAuth = useTranslations('auth');
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
      toast.error(tAuth('firebaseNotConfigured'));
      return;
    }
    setLoading(true);
    try {
      const appUser = await signInWithGoogle();
      if (appUser) {
        setUser(appUser);
        toast.success(tAuth('signInSuccess'));
      }
    } catch (e) {
      toast.error(tAuth('signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (!isFirebaseEnabled()) {
      toast.error(tAuth('firebaseNotConfigured'));
      return;
    }
    setLoading(true);
    try {
      const appUser = isRegister
        ? await registerWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (appUser) {
        setUser(appUser);
        toast.success(isRegister ? tAuth('accountCreated') : tAuth('signInSuccess'));
      } else {
        toast.error(tAuth('invalidCredentials'));
      }
    } catch {
      toast.error(tAuth('signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      toast.success(tAuth('signedOut'));
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseEnabled()) {
    return (
      <p className="text-xs text-slate-400">
        {tAuth('signInDisabled')}
      </p>
    );
  }

  if (user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-200">
          {user.email ?? tAuth('signedIn')}
        </p>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
          disabled={loading}
          aria-label={tAuth('signOut')}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {tAuth('signOut')}
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
        aria-label={tAuth('signInWithGoogle')}
      >
        <LogIn className="w-4 h-4 mr-2" />
        {tAuth('signInWithGoogle')}
      </Button>

      <form onSubmit={handleEmailSubmit} className="space-y-2">
        <input
          type="email"
          placeholder={tAuth('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ramadan-green"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder={tAuth('password')}
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
            {isRegister ? tAuth('register') : tAuth('signIn')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRegister((v) => !v)}
          >
            {isRegister ? tAuth('signIn') : tAuth('register')}
          </Button>
        </div>
      </form>
    </div>
  );
}
