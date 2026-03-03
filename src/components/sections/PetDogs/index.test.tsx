import { fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PetDogs from '.';

let isInView = true;
let dogsData = [
  { name: 'Nala', stats: { treats: 1, scritches: 2 } },
  { name: 'Rosie', stats: { treats: 3, scritches: 4 } },
  { name: 'Tito', stats: { treats: 5, scritches: 6 } },
];
const updateStatsMock = vi.fn();

vi.mock('@/hooks/usePetDogs', () => ({
  usePetDogs: () => [dogsData, updateStatsMock],
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionFactory = (tag: keyof HTMLElementTagNameMap) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children)
    );

  return {
    motion: {
      button: motionFactory('button'),
    },
    useInView: () => isInView,
  };
});

describe('PetDogs section', () => {
  beforeEach(() => {
    isInView = true;
    dogsData = [
      { name: 'Nala', stats: { treats: 1, scritches: 2 } },
      { name: 'Rosie', stats: { treats: 3, scritches: 4 } },
      { name: 'Tito', stats: { treats: 5, scritches: 6 } },
    ];
    vi.clearAllMocks();
  });

  it('toggles dogs panel and renders foster badge branch for Nala only', () => {
    render(<PetDogs />);

    const toggle = screen.getByRole('button', { name: 'Show dogs' });
    const section = document.getElementById('pet-dogs');
    if (!section) throw new Error('missing pet dogs section');
    expect(section.className).toContain('collapsed');

    fireEvent.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Hide dogs' })
    ).toBeInTheDocument();
    expect(section.className).toContain('expanded');
    expect(
      screen.getByText('Sure you can!', { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText('Foster')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hide dogs' }));
    expect(
      screen.getByRole('button', { name: 'Show dogs' })
    ).toBeInTheDocument();
    expect(screen.queryByText('Sure you can!')).not.toBeInTheDocument();
  });

  it('fires treat/scritch callbacks for each dog entry', () => {
    render(<PetDogs />);
    fireEvent.click(screen.getByRole('button', { name: 'Show dogs' }));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Give Nala a treat. Current treats: 1',
      })
    );
    expect(updateStatsMock).toHaveBeenCalledWith('Nala', 'treats');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Give Rosie some scritches. Current scritches: 4',
      })
    );
    expect(updateStatsMock).toHaveBeenCalledWith('Rosie', 'scritches');
  });

  it('renders collapsed state while out of view', () => {
    isInView = false;
    render(<PetDogs />);
    expect(screen.getByRole('button', { name: 'Show dogs' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});
