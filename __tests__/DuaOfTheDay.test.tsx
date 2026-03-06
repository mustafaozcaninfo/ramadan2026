import { render, screen } from '@testing-library/react';
import { DuaOfTheDay } from '@/components/DuaOfTheDay';

describe('DuaOfTheDay component', () => {
  it('renders heading for Turkish locale', () => {
    render(<DuaOfTheDay locale="tr" />);
    expect(screen.getByRole('article', { name: 'Günün Duası' })).toBeInTheDocument();
  });

  it('renders heading for English locale', () => {
    render(<DuaOfTheDay locale="en" />);
    expect(screen.getByRole('article', { name: 'Dua of the Day' })).toBeInTheDocument();
  });
});

