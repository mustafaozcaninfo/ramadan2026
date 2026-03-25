import type { Redis } from '@upstash/redis';

/** Current Redis prefix for Web Push subscriptions (Upstash). */
export const PUSH_SUBSCRIPTION_PREFIX = 'prayer:push:';

/** Legacy prefix — still scanned so old keys work until they expire or are deleted. */
export const LEGACY_PUSH_SUBSCRIPTION_PREFIX = 'ramadan:push:';

export function isPushSentKey(key: string): boolean {
  return (
    key.startsWith(`${PUSH_SUBSCRIPTION_PREFIX}sent:`) ||
    key.startsWith(`${LEGACY_PUSH_SUBSCRIPTION_PREFIX}sent:`)
  );
}

/** Subscription keys only (excludes `*:sent:*` dedupe keys). */
export function filterPushSubscriptionKeys(keys: string[]): string[] {
  return keys.filter((k) => !isPushSentKey(k));
}

/** All keys matching either current or legacy push prefix. */
export async function fetchAllPushRedisKeys(redis: Redis): Promise<string[]> {
  const [a, b] = await Promise.all([
    redis.keys(`${PUSH_SUBSCRIPTION_PREFIX}*`),
    redis.keys(`${LEGACY_PUSH_SUBSCRIPTION_PREFIX}*`),
  ]);
  return [...new Set([...a, ...b])];
}

/** Human-readable suffix after `*:push:sent:` (for ops / logs). */
export function stripPushSentKeyPrefix(key: string): string {
  for (const p of [PUSH_SUBSCRIPTION_PREFIX, LEGACY_PUSH_SUBSCRIPTION_PREFIX]) {
    const sent = `${p}sent:`;
    if (key.startsWith(sent)) return key.slice(sent.length);
  }
  return key;
}
