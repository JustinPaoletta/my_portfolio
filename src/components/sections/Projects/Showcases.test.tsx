import { fireEvent, render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { DesignSystemShowcase } from './DesignSystemShowcase';
import { ExportShowcase } from './ExportShowcase';

describe('project evidence', () => {
  it('loads each design-system capture on demand with the corresponding full-size link', () => {
    render(<DesignSystemShowcase />);
    for (const [name, slug, width] of [
      ['Dashboard', 'dashboard', 1440],
      ['Forms', 'forms', 960],
      ['Data', 'data', 960],
      ['Assistant', 'assistant', 960],
    ] as const) {
      fireEvent.click(screen.getByRole('tab', { name }));
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute(
        'src',
        `/images/projects/design-system-${slug}-960.webp`
      );
      expect(image.getAttribute('srcset')).toContain(
        `${slug}-${width}.webp ${width}w`
      );
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        `/images/projects/design-system-${slug}-${width}.webp`
      );
      expect(screen.getByText(/Fictional club data/)).toBeInTheDocument();
    }
    expect(screen.getByText(/fixed sample response/)).toBeInTheDocument();
  });

  it('exposes authentic export formats and a local downloadable archive', () => {
    render(<ExportShowcase />);
    expect(
      screen.getByRole('region', { name: 'CLI output excerpts' })
    ).toHaveTextContent('Skipped (cached) : 2');
    fireEvent.click(screen.getByRole('tab', { name: 'CSV' }));
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('columnheader')).toHaveLength(6);
    fireEvent.click(screen.getByRole('tab', { name: 'JSON' }));
    const json = JSON.parse(
      screen
        .getByRole('region', { name: 'JSON export preview' })
        .querySelector('code')!.textContent!
    );
    expect(json.FieldValues).toBeInstanceOf(Array);
    fireEvent.click(screen.getByRole('tab', { name: 'Files' }));
    expect(
      screen.getByText('files/Documents/member-guide.txt')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All names and files are fictional/)
    ).toBeInTheDocument();
    const download = screen.getByRole('link', {
      name: /Download sample export/,
    });
    expect(download).toHaveAttribute('download');
    expect(download).toHaveAttribute('href', '/demos/wild-apricot-sample.zip');
  });
});
