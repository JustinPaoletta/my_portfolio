import { fireEvent } from '@/test/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import {
  getFocusableElements,
  trapFocusWithin,
  temporarilyInertElements,
} from './accessibility';

afterEach(() => document.body.replaceChildren());
function container(markup: string) {
  const node = document.createElement('div');
  node.tabIndex = -1;
  node.innerHTML = markup;
  document.body.append(node);
  return node;
}
describe('navigation accessibility utilities', () => {
  it('filters disabled, hidden, and aria-hidden descendants from keyboard targets', () => {
    const node = container(
      '<a href="#one">One</a><button disabled>Disabled</button><button hidden>Hidden</button><button style="display:none">Display</button><button style="visibility:hidden">Invisible</button><div aria-hidden="true"><button>Decorative</button></div><input type="hidden"><input aria-label="Two"><button>Three</button>'
    );
    expect(getFocusableElements(node).map((e) => e.tagName)).toEqual([
      'A',
      'INPUT',
      'BUTTON',
    ]);
  });
  it('wraps keyboard focus at either end and leaves ordinary keys and intermediate tabs alone', () => {
    const node = container('<button>One</button><input><button>Three</button>');
    const [first, middle, last] = getFocusableElements(node);
    const send = (key: string, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key,
        shiftKey,
        cancelable: true,
      });
      trapFocusWithin(event, node);
      return event;
    };
    first.focus();
    expect(send('Escape').defaultPrevented).toBe(false);
    expect(send('Tab', true).defaultPrevented).toBe(true);
    expect(last).toHaveFocus();
    expect(send('Tab').defaultPrevented).toBe(true);
    expect(first).toHaveFocus();
    middle.focus();
    expect(send('Tab').defaultPrevented).toBe(false);
    expect(middle).toHaveFocus();
  });
  it('focuses an empty dialog and restores previous inert/aria-hidden values', () => {
    const empty = container('');
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      cancelable: true,
    });
    trapFocusWithin(event, empty);
    expect(empty).toHaveFocus();
    const existing = container('<button>Background</button>');
    existing.setAttribute('aria-hidden', 'false');
    existing.inert = true;
    const restore = temporarilyInertElements([empty, null, existing]);
    expect(empty.inert).toBe(true);
    expect(existing.getAttribute('aria-hidden')).toBe('true');
    restore();
    expect(empty).not.toHaveAttribute('aria-hidden');
    expect(existing).toHaveAttribute('aria-hidden', 'false');
    expect(existing.inert).toBe(true);
    fireEvent.keyDown(empty, { key: 'Escape' });
  });
});
