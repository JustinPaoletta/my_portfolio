import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Skills from '.';

describe('Skills section', () => {
  it('connects the focused stack to experience and inspectable source', () => {
    render(<Skills />);

    expect(
      screen.getByRole('link', { name: 'See the modernization work' })
    ).toHaveAttribute('href', '#experience');
    expect(
      screen.getByRole('link', { name: 'See the delivery work' })
    ).toHaveAttribute('href', '#experience');
    expect(
      screen.getByRole('link', { name: 'Inspect the BitStockerz source' })
    ).toHaveAttribute('href', 'https://github.com/JustinPaoletta/BitStockerz');
    expect(
      screen.getByText(/The project is in development/)
    ).toBeInTheDocument();
    expect(screen.getByText('MySQL/MariaDB')).toBeInTheDocument();
  });
});
