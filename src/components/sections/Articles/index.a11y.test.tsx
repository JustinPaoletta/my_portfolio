import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Articles from '.';

describe('Articles accessibility', () => {
  it('has no violations for the carousel on the default slide', async () => {
    render(<Articles />);

    const carousel = screen.getByRole('region', { name: 'Article slides' });

    expect(await axe(carousel)).toHaveNoViolations();
  });

  it('has no violations after navigating to another slide', async () => {
    const user = userEvent.setup();

    render(<Articles />);

    await user.click(screen.getByRole('button', { name: 'Next article' }));

    const carousel = screen.getByRole('region', { name: 'Article slides' });

    expect(await axe(carousel)).toHaveNoViolations();
  });
});
