import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /vite \+ react/i })
    ).toBeInTheDocument();
  });

  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole('button', { name: /count is 0/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(
      screen.getByRole('button', { name: /count is 1/i })
    ).toBeInTheDocument();

    await user.click(button);
    expect(
      screen.getByRole('button', { name: /count is 2/i })
    ).toBeInTheDocument();
  });

  it('renders the logos', () => {
    render(<App />);

    const viteLogo = screen.getByAltText(/vite logo/i);
    const reactLogo = screen.getByAltText(/react logo/i);

    expect(viteLogo).toBeInTheDocument();
    expect(reactLogo).toBeInTheDocument();
  });
});
