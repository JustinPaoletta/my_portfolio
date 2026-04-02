import { act, fireEvent, render, screen } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Contact from '.';

describe('Contact accessibility', () => {
  it('has no violations for the default form state', async () => {
    const { container } = render(<Contact />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('announces inline validation states accessibly', async () => {
    render(<Contact />);

    const submitButton = screen.getByRole('button', { name: /send message/i });
    const form = submitButton.closest('form');
    if (!form) throw new Error('missing contact form');

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'bad-email', name: 'email' },
    });
    fireEvent.submit(form);

    await act(async () => {
      expect(screen.getByLabelText('Your Name')).toHaveFocus();
    });

    expect(screen.getByLabelText('Your Name')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(
      screen.getByText(/Enter a valid email address./i)
    ).toBeInTheDocument();
  });
});
