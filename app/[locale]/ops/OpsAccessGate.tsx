'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function OpsAccessGate({ authConfigured }: { authConfigured: boolean }) {
  const t = useTranslations('ops');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ops/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        if (res.status === 401) setError(t('invalidPassword'));
        else if (res.status === 429) setError(t('tooManyAttempts'));
        else if (res.status === 503) setError(t('opsPasswordMissing'));
        else setError(t('loginFailed'));
        return;
      }

      setPassword('');
      router.refresh();
    } catch {
      setError(t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-600/60 bg-slate-900/65 p-5 sm:p-6 shadow-2xl">
      <div className="mb-5 text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-ramadan-gold/50 bg-slate-950/70 text-ramadan-gold">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-amber-50">{t('accessTitle')}</h2>
        <p className="mt-2 text-sm text-slate-300">{t('accessSubtitle')}</p>
      </div>
      {!authConfigured ? (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {t('opsPasswordMissing')}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm text-slate-300" htmlFor="ops-password">
          {t('passwordLabel')}
        </label>
        <input
          id="ops-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          className="h-11 w-full rounded-lg border border-slate-600/70 bg-slate-950/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-ramadan-gold/60 focus:outline-none"
          disabled={loading || !authConfigured}
          required
        />
        {error ? (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading || !password || !authConfigured}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ramadan-green px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {loading ? t('signingIn') : t('signIn')}
        </button>
      </form>
    </section>
  );
}
