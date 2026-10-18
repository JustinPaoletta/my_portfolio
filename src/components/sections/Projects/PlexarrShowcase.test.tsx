import { fireEvent, render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { PlexarrShowcase } from './PlexarrShowcase';

describe('Plexarr screenshot carousel', () => {
  it('loads only the selected screenshots and wraps through real captures', () => {
    const { container } = render(<PlexarrShowcase />);
    const next = screen.getByRole('button', {
      name: 'Next Plexarr screenshot',
    });
    const previous = screen.getByRole('button', {
      name: 'Previous Plexarr screenshot',
    });
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    fireEvent.click(previous);
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: 'Show Title details & ratings' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('link', { name: /full-size rating/ })
    ).toHaveAttribute('href', '/images/projects/plexarr-rating-522.webp');
    fireEvent.click(next);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/images/projects/plexarr-picks-700.webp'
    );
    expect(
      screen.queryByAltText(/Live Plexarr Discover catalog/)
    ).not.toBeInTheDocument();
    expect(container.querySelector('video, iframe, source, track')).toBeNull();
    expect(container).not.toHaveTextContent(/request/i);
  });

  it('supports direct selection and keyboard navigation without moving focus', () => {
    render(<PlexarrShowcase />);
    const next = screen.getByRole('button', {
      name: 'Next Plexarr screenshot',
    });
    next.focus();
    for (const [key, counter] of [
      ['ArrowRight', '2 of 3'],
      ['End', '3 of 3'],
      ['Home', '1 of 3'],
      ['ArrowLeft', '3 of 3'],
    ]) {
      fireEvent.keyDown(next, { key });
      expect(screen.getByText(counter)).toBeInTheDocument();
      expect(next).toHaveFocus();
    }
    fireEvent.keyDown(next, { key: 'ArrowRight', altKey: true });
    fireEvent.keyDown(next, { key: 'Escape' });
    expect(screen.getByText('3 of 3')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show Personalized picks' })
    );
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    const current = screen.getByRole('group', {
      name: 'Personalized picks, 2 of 3',
    });
    expect(current.id).toBe(next.getAttribute('aria-controls'));
  });

  it('recognizes horizontal swipes while preserving vertical scroll and canceled gestures', () => {
    const { container } = render(<PlexarrShowcase />);
    const media = container.querySelector('.plexarr-carousel__media')!;
    const start = () =>
      fireEvent.touchStart(media, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
    const end = (x: number, y: number) =>
      fireEvent.touchEnd(media, {
        changedTouches: [{ clientX: x, clientY: y }],
      });
    start();
    end(190, 200);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    start();
    end(180, 100);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    start();
    end(100, 105);
    expect(screen.getByText('2 of 3')).toBeInTheDocument();
    start();
    end(300, 105);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    start();
    fireEvent.touchCancel(media);
    end(100, 100);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
    fireEvent.touchStart(media, {
      touches: [
        { clientX: 200, clientY: 100 },
        { clientX: 220, clientY: 100 },
      ],
    });
    end(100, 100);
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });
});
