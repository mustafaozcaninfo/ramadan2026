import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match internationalized pathnames and important top-level routes
  // This ensures that `/calendar`, `/settings`, `/about`, and `/test` work for the default locale (tr)
  matcher: ['/', '/calendar', '/settings', '/about', '/test', '/(tr|en)/:path*'],
};
