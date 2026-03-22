import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Security headers (kept permissive to avoid breaking existing behaviour)
  if (response instanceof NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  }

  return response;
}

export const config = {
  // Match internationalized pathnames and important top-level routes
  // This ensures that `/calendar`, `/settings`, `/about`, and `/test` work for the default locale (tr)
  matcher: [
    '/',
    '/calendar',
    '/settings',
    '/about',
    '/test',
    '/live',
    '/resources',
    '/resources/:path*',
    '/ops',
    '/(tr|en|ar)/:path*',
  ],
};
