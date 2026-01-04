import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import App from './App';

describe('App', () => {
  it('renders the heading with app title from env', () => {
    render(<App />);
    // App title comes from environment variable VITE_APP_TITLE
    // In tests, this is set to "Test App" via vitest.config.ts defaults
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/./); // Ensures heading has some text
  });

  it('renders the JP image with correct attributes', () => {
    render(<App />);

    const jpImage = screen.getByAltText(/Justin Paoletta/i);
    expect(jpImage).toBeInTheDocument();
    expect(jpImage).toHaveAttribute('width', '160');
    expect(jpImage).toHaveAttribute('height', '160');
    expect(jpImage).toHaveAttribute('src', '/jp-200.webp');
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

    expect(
      screen.getByRole('navigation', { name: /main navigation/i })
    ).toBeInTheDocument(); // main nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
  });
});
