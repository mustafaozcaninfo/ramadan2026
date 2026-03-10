import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { DuaOfTheDay } from '@/components/DuaOfTheDay';

function renderWithIntl(locale: 'tr' | 'en') {
  const messages = {
    common: {
      duaOfTheDay: locale === 'tr' ? 'Günün Duası' : 'Dua of the Day',
    },
    ui: {
      copy: locale === 'tr' ? 'Kopyala' : 'Copy',
      share: locale === 'tr' ? 'Paylaş' : 'Share',
      copied: locale === 'tr' ? 'Kopyalandı' : 'Copied',
    },
  };

  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DuaOfTheDay locale={locale} />
    </NextIntlClientProvider>
  );
}

describe('DuaOfTheDay component', () => {
  it('renders heading for Turkish locale', () => {
    renderWithIntl('tr');
    expect(screen.getByRole('article', { name: 'Günün Duası' })).toBeInTheDocument();
  });

  it('renders heading for English locale', () => {
    renderWithIntl('en');
    expect(screen.getByRole('article', { name: 'Dua of the Day' })).toBeInTheDocument();
  });
});
