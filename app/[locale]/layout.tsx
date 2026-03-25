import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/react';
import { routing } from '@/lib/i18n/routing';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'sonner';
import type { Metadata, Viewport } from 'next';
import { SWRegister } from './sw-register';
import { NotificationManager } from '@/components/NotificationManager';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tHome = await getTranslations({ locale, namespace: 'home' });

  return {
    title: `${tCommon('appName')} - ${tHome('subtitle')}`,
    description: tHome('subtitle'),
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: tCommon('appName'),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#10b981',
  viewportFit: 'cover',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} overscroll-none`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster position="top-center" theme="dark" />
          <SWRegister />
          <NotificationManager />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
