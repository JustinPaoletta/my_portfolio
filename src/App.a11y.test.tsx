import { render, screen } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App accessibility', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('', { status: 404, statusText: 'Not Found' })
        )
    );
  });

  it('has no accessibility violations in the default theme shell', async () => {
    render(<App />);

    const main = await screen.findByRole('main');

    await act(async () => {
      expect(await axe(main)).toHaveNoViolations();
    });
  });
});
