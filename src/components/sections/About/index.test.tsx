import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import About from '.';

describe('About section', () => {
  it('presents professional background and a viewable résumé', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByText('frontend architecture')).toBeInTheDocument();
    expect(
      screen.getByText('3–4 hour process to about 25 minutes.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View résumé' })).toHaveAttribute(
      'href',
      '/resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
