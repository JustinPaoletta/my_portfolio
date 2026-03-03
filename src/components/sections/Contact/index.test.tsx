import { act, fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '.';

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionFactory = (tag: keyof HTMLElementTagNameMap) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children)
    );

  return {
    motion: {
      section: motionFactory('section'),
      header: motionFactory('header'),
      span: motionFactory('span'),
      h2: motionFactory('h2'),
      div: motionFactory('div'),
      a: motionFactory('a'),
      form: motionFactory('form'),
    },
    useInView: () => true,
  };
});

describe('Contact section', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contact methods and form fields', () => {
    render(<Contact />);

    expect(
      screen.getByRole('heading', { name: 'Get In Touch' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /let's connect/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('submits successfully, resets form, and clears success status timer', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);

    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Justin', name: 'name' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'justin@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there', name: 'message' },
    });
    const submitButton = screen.getByRole('button', { name: /send message/i });
    const form = submitButton.closest('form');
    if (!form) throw new Error('missing contact form');
    fireEvent.submit(form);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Justin',
          email: 'justin@example.com',
          message: 'Hello there',
        }),
      })
    );

    expect(screen.getByText(/Message sent successfully!/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Your Name')).toHaveValue('');
    expect(screen.getByLabelText('Email Address')).toHaveValue('');
    expect(screen.getByLabelText('Message')).toHaveValue('');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      screen.queryByText(/Message sent successfully!/i)
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('handles failed submission and clears error status timer', async () => {
    vi.useFakeTimers();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'Nope' }), { status: 500 })
        )
    );

    render(<Contact />);

    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Justin', name: 'name' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'justin@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there', name: 'message' },
    });
    const submitButton = screen.getByRole('button', { name: /send message/i });
    const form = submitButton.closest('form');
    if (!form) throw new Error('missing contact form');
    fireEvent.submit(form);

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(
      screen.getByText(/Failed to send message. Please try again/i)
    ).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(
      screen.queryByText(/Failed to send message. Please try again/i)
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('disables submit button while envelope animation or submitting is active', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);

    fireEvent.change(screen.getByLabelText('Your Name'), {
      target: { value: 'Justin', name: 'name' },
    });
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'justin@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Hello there', name: 'message' },
    });

    const submitButton = screen.getByRole('button', { name: /send message/i });
    const form = submitButton.closest('form');
    if (!form) throw new Error('missing contact form');
    fireEvent.submit(form);
    expect(submitButton).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /send message/i })
    ).not.toBeDisabled();
    vi.useRealTimers();
  });
});
