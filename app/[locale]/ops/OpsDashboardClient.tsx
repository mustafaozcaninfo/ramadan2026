'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCcw, Server, Bell, MapPinned } from 'lucide-react';
import { useTranslations } from 'next-intl';

type OpsSummary = {
  generatedAt: string;
  durationMs: number;
  env: {
    redisConfigured: boolean;
    vapidConfigured: boolean;
    cronSecretConfigured: boolean;
  };
  summary: {
    cityChecksTotal: number;
    cityChecksOk: number;
    subscriptionsTotal: number;
    subscriptionsSampled: number;
    sentSlotsTotal: number;
  };
  push: {
    localeCounts: Record<string, number>;
    providerCounts: Record<string, number>;
    intervalCounts: Record<string, number>;
    recentSentSlots: string[];
  };
  nextReminder: {
    type: 'fajr' | 'maghrib';
    minutes: number;
    runAt: number;
    runAtIso: string;
    dohaDate: string;
  } | null;
  cityChecks: Array<{
    city: string;
    country: string;
    timezone: string | null;
    method: string | null;
    ok: boolean;
    durationMs: number;
    date?: string | null;
    fajr?: string | null;
    maghrib?: string | null;
    error?: string;
  }>;
  warnings: string[];
};

function StatCard({
  title,
  value,
  icon,
  tone = 'neutral',
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'neutral' | 'success' | 'danger';
  subtitle?: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : tone === 'danger'
        ? 'border-red-500/40 bg-red-500/10'
        : 'border-slate-600/60 bg-slate-800/50';

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-300 uppercase tracking-wide">{title}</p>
        <div className="text-slate-200">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

export function OpsDashboardClient() {
  const t = useTranslations('ops');
  const [data, setData] = useState<OpsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/ops/summary', { cache: 'no-store' });
      if (!res.ok) {
        setError(`${t('loadFailed')} (${res.status})`);
        return;
      }
      const json = (await res.json()) as OpsSummary;
      setData(json);
    } catch {
      setError(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(id);
  }, [load]);

  const cityFailures = useMemo(() => data?.cityChecks.filter((c) => !c.ok) ?? [], [data]);
  const translateWarning = (warning: string) => {
    if (warning === 'VAPID keys are missing') return t('warningVapidMissing');
    if (warning === 'Upstash Redis is not configured') return t('warningRedisMissing');
    if (warning === 'Some city timing checks failed') return t('warningCityChecksFailed');
    return warning;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-slate-600/60 bg-slate-800/45 p-3 sm:p-4">
        <div>
          <p className="text-xs text-slate-400">{t('autoRefresh')}</p>
          <p className="text-sm text-slate-200">
            {data?.generatedAt
              ? t('lastUpdate', { value: new Date(data.generatedAt).toLocaleString() })
              : t('waitingSnapshot')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-500/70 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80"
        >
          <RefreshCcw className="w-4 h-4" />
          {t('refresh')}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      ) : null}

      {loading && !data ? (
        <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-6 text-slate-300">{t('loading')}</div>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title={t('cityHealth')}
              value={`${data.summary.cityChecksOk}/${data.summary.cityChecksTotal}`}
              icon={<MapPinned className="w-4 h-4" />}
              tone={data.summary.cityChecksOk === data.summary.cityChecksTotal ? 'success' : 'danger'}
            />
            <StatCard
              title={t('activeSubscriptions')}
              value={String(data.summary.subscriptionsTotal)}
              icon={<Bell className="w-4 h-4" />}
              subtitle={t('sampled', { value: data.summary.subscriptionsSampled })}
            />
            <StatCard
              title={t('sentSlots')}
              value={String(data.summary.sentSlotsTotal)}
              icon={<Clock3 className="w-4 h-4" />}
            />
            <StatCard
              title={t('apiLatency')}
              value={`${data.durationMs}ms`}
              icon={<Activity className="w-4 h-4" />}
              tone={data.durationMs < 1200 ? 'success' : 'neutral'}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-brand-gold" />
                {t('envReadiness')}
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: t('redis'), ok: data.env.redisConfigured },
                  { label: t('vapidKeys'), ok: data.env.vapidConfigured },
                  { label: t('cronSecret'), ok: data.env.cronSecretConfigured },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between border border-slate-700/60 rounded-lg px-3 py-2">
                    <span className="text-slate-300">{label}</span>
                    <span className={`inline-flex items-center gap-1 text-xs ${ok ? 'text-emerald-300' : 'text-red-300'}`}>
                      {ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {ok ? t('ok') : t('missing')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-brand-gold" />
                {t('nextReminder')}
              </h3>
              {data.nextReminder ? (
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">{t('type')}: <span className="text-slate-100 font-semibold uppercase">{data.nextReminder.type === 'fajr' ? t('fajr') : t('maghrib')}</span></p>
                  <p className="text-slate-300">{t('minutesBefore')}: <span className="text-slate-100 font-semibold">{data.nextReminder.minutes}</span></p>
                  <p className="text-slate-300">{t('runAt')}: <span className="text-slate-100 font-semibold">{new Date(data.nextReminder.runAtIso).toLocaleString()}</span></p>
                  <p className="text-slate-400 text-xs">{t('dohaDate')}: {data.nextReminder.dohaDate}</p>
                </div>
              ) : (
                <p className="text-slate-300 text-sm">{t('noUpcoming')}</p>
              )}
            </div>
          </div>

          {data.warnings.length ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <h3 className="text-sm font-semibold text-amber-100 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                {t('warnings')}
              </h3>
              <ul className="space-y-1 text-sm text-amber-100">
                {data.warnings.map((w) => (
                  <li key={w}>• {translateWarning(w)}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-4 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">{t('cityTimingHealth')}</h3>
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700/70">
                  <th className="text-left py-2 pr-3">{t('city')}</th>
                  <th className="text-left py-2 pr-3">{t('method')}</th>
                  <th className="text-left py-2 pr-3">{t('date')}</th>
                  <th className="text-left py-2 pr-3">{t('fajr')}</th>
                  <th className="text-left py-2 pr-3">{t('maghrib')}</th>
                  <th className="text-left py-2 pr-3">{t('latency')}</th>
                  <th className="text-left py-2">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {data.cityChecks.map((c) => (
                  <tr key={`${c.city}-${c.country}`} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 text-slate-200">{c.city}, {c.country}</td>
                    <td className="py-2 pr-3 text-slate-300">{c.method ?? '-'}</td>
                    <td className="py-2 pr-3 text-slate-300">{c.date ?? '-'}</td>
                    <td className="py-2 pr-3 text-slate-300 tabular-nums">{c.fajr ?? '-'}</td>
                    <td className="py-2 pr-3 text-slate-300 tabular-nums">{c.maghrib ?? '-'}</td>
                    <td className="py-2 pr-3 text-slate-300">{c.durationMs}ms</td>
                    <td className={`py-2 ${c.ok ? 'text-emerald-300' : 'text-red-300'}`}>
                      {c.ok ? t('ok') : c.error ?? t('failed')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-4">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">{t('pushDistribution')}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">{t('locales')}</p>
                  <p className="text-slate-200">
                    {Object.entries(data.push.localeCounts)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                      .join(' • ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">{t('providers')}</p>
                  <p className="text-slate-200">{Object.entries(data.push.providerCounts).map(([k, v]) => `${k}:${v}`).join(' • ') || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">{t('intervals')}</p>
                  <p className="text-slate-200">{Object.entries(data.push.intervalCounts).sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `${k}m:${v}`).join(' • ') || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-600/60 bg-slate-800/50 p-4">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">{t('recentSentSlots')}</h3>
              <div className="max-h-48 overflow-auto pr-1">
                {data.push.recentSentSlots.length ? (
                  <ul className="space-y-1 text-sm text-slate-300">
                    {data.push.recentSentSlots.map((slot) => (
                      <li key={slot} className="font-mono text-xs bg-slate-900/40 border border-slate-700/60 rounded px-2 py-1">{slot}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">{t('noSentSlotData')}</p>
                )}
              </div>
            </div>
          </div>

          {cityFailures.length ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
              <p className="font-semibold mb-1">{t('cityFailures', { count: cityFailures.length })}</p>
              <p>{cityFailures.map((c) => `${c.city} (${c.error ?? t('failed')})`).join(', ')}</p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
