import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import Experience from '.';

let isInView = true;

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionFactory = (tag: keyof HTMLElementTagNameMap) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      ({ children, ...props }, ref) =>
        React.createElement(tag, { ref, ...props }, children)
    );

  return {
    motion: {
      header: motionFactory('header'),
      span: motionFactory('span'),
      h2: motionFactory('h2'),
      div: motionFactory('div'),
      article: motionFactory('article'),
    },
    useInView: () => isInView,
  };
});

describe('Experience section', () => {
  it('renders work/education timelines and current-role indicators', () => {
    isInView = true;
    render(<Experience />);

    expect(
      screen.getByRole('heading', { name: 'Experience & Education' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Work Experience' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Education' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Current position')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'accesso' })).toHaveAttribute(
      'href',
      'https://www.accesso.com'
    );
    expect(
      screen.getByRole('link', { name: 'University of Central Florida' })
    ).toHaveAttribute('href', 'https://www.ucf.edu');

    expect(screen.getAllByText('Angular').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: 'Download resume as PDF' })
    ).toHaveAttribute('download', 'Justin_Paoletta_Resume.pdf');
  });

  it('renders timeline content when out of view (hidden animation branch)', () => {
    isInView = false;
    render(<Experience />);

    expect(screen.getByText('UI Engineer')).toBeInTheDocument();
    expect(
      screen.getByText('Bachelor of Science (B.S.) in Psychology')
    ).toBeInTheDocument();
  });
});
