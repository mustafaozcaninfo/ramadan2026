import { createHash, timingSafeEqual } from 'crypto';

export const OPS_AUTH_COOKIE = 'prayer-ops-auth';
const OPS_AUTH_SALT = 'prayer-ops-v1';

function getOpsPassword() {
  return process.env.OPS_DASHBOARD_PASSWORD || null;
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function expectedCookieValue(password: string) {
  return hash(`${password}:${OPS_AUTH_SALT}`);
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function isOpsAuthConfigured() {
  const password = getOpsPassword();
  return typeof password === 'string' && password.length >= 12;
}

export function isValidOpsPassword(password: string) {
  const configuredPassword = getOpsPassword();
  if (!configuredPassword) return false;
  return safeEqual(password, configuredPassword);
}

export function createOpsCookieValue() {
  const configuredPassword = getOpsPassword();
  if (!configuredPassword) return null;
  return expectedCookieValue(configuredPassword);
}

export function isOpsAuthenticatedFromCookie(cookieValue?: string | null) {
  const configuredPassword = getOpsPassword();
  if (!configuredPassword || !cookieValue) return false;
  return safeEqual(cookieValue, expectedCookieValue(configuredPassword));
}
