import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { SectionRouteFallback } from '@/components/SectionRouteFallback';

describe('SectionRouteFallback', () => {
  it('names the deferred dog section clearly', () => {
    render(<SectionRouteFallback sectionId="pet-dogs" />);
    expect(
      screen.getByRole('status', { name: 'Loading Pet dogs section' })
    ).toHaveAttribute('aria-live', 'polite');
  });
  it('exposes an accessible busy status and stable hook for e2e', () => {
    render(<SectionRouteFallback sectionId="contact" />);

    const status = screen.getByRole('status', {
      name: /loading contact section/i,
    });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('data-section-route-fallback');
    expect(status).toHaveAttribute('data-section-id', 'contact');
  });
});
