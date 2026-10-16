import { render } from '@/test/test-utils';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import Skills from '.';

describe('Skills accessibility', () => {
  it('has no violations for the applied skill groups', async () => {
    const { container } = render(<Skills />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
