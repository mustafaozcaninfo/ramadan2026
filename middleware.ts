import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match internationalized pathnames and important top-level routes
  // This ensures that `/calendar` and `/test` work for the default locale (tr)
  matcher: ['/', '/calendar', '/test', '/(tr|en)/:path*'],
};
