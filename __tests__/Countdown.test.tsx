import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Countdown } from '@/components/Countdown';

describe('Countdown component', () => {
  it('renders label and time parts', () => {
    render(<Countdown targetTime="23:59" label="Test Countdown" locale="en" />);

    expect(screen.getByText('Test Countdown')).toBeInTheDocument();
    expect(screen.getByText(/Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Seconds/i)).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Countdown targetTime="23:59" label="Test Countdown" locale="en" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

