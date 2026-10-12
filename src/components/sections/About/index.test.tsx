import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import About from '.';

describe('About section', () => {
  it('connects the engineering approach to professional experience', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Read my professional experience' })
    ).toHaveAttribute('href', '#experience');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByText(/deterministic checks and human review/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
