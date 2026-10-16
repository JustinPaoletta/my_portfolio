import { render } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { getRevealClassName, getRevealStyle, Reveal } from './Reveal';

describe('section reveal defaults', () => {
  it('preserves supplied styles and uses accessible native content with default options', () => {
    expect(getRevealStyle()).toEqual({ '--reveal-delay': '0ms' });
    expect(getRevealStyle(120, { color: 'red' })).toEqual({
      color: 'red',
      '--reveal-delay': '120ms',
    });
    expect(getRevealClassName({ visible: false })).toBe(
      'reveal reveal--fade-up'
    );
    const view = render(
      <Reveal visible>
        <p>Readable content</p>
      </Reveal>
    );
    expect(view.container.firstElementChild?.tagName).toBe('DIV');
    expect(view.container.firstElementChild).toHaveClass('reveal--visible');
  });
});
