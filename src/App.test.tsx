import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /JP Engineering/i })
    ).toBeInTheDocument();
  });

  it('renders the JP image with correct attributes', () => {
    render(<App />);

    const jpImage = screen.getByAltText(/JP/i);
    expect(jpImage).toBeInTheDocument();
    expect(jpImage).toHaveAttribute('width', '100');
    expect(jpImage).toHaveAttribute('height', '100');
    expect(jpImage).toHaveAttribute('src', '/jp-100.webp');
  });

  it('renders skip link for keyboard navigation', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', {
      name: /skip to main content/i,
    });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main');
  });

  it('renders semantic HTML structure', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
});
