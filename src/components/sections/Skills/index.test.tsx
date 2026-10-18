import { render, screen, within } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Skills from '.';

describe('Skills section', () => {
  it('keeps technology names readable in each static skill group', () => {
    render(<Skills />);

    for (const [category, technologies] of [
      ['Frontend systems', ['Angular', 'React', 'TypeScript', 'RxJS', 'SCSS']],
      ['Testing & delivery', ['Playwright', 'GitHub Actions', 'Jenkins']],
      ['APIs & data', ['Node.js', 'NestJS', 'Prisma', 'MySQL/MariaDB']],
      ['AI-assisted development', ['Claude Code', 'Codex', 'Cursor (IDE)']],
    ] as const) {
      const group = screen.getByRole('list', {
        name: `${category} technologies`,
      });
      for (const technology of technologies) {
        expect(within(group).getByText(technology)).toBeVisible();
      }
    }
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
