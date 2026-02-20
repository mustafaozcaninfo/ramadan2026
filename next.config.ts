import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import withSerwistInit from '@serwist/next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  // Avoid monorepo root inference warnings when multiple lockfiles exist.
  outputFileTracingRoot: __dirname,
};

export default withSerwist(withNextIntl(nextConfig));
