import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Experience from '.';

describe('Experience section', () => {
  it('renders work/education timelines and current-role indicators', () => {
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

  it('renders timeline content consistently', () => {
    render(<Experience />);

    expect(
      screen.getByText('Software Engineer (UI Engineer)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Bachelor of Science (B.S.) in Psychology')
    ).toBeInTheDocument();
  });
});
