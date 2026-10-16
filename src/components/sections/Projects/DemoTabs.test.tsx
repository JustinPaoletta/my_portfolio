import { fireEvent, render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { DemoTabs } from './DemoTabs';

describe('project demo tabs', () => {
  it('uses roving focus, wraps in both directions, and mounts only the active demo', () => {
    render(
      <DemoTabs
        label="Examples"
        items={['One', 'Two', 'Three'].map((label) => ({
          label,
          content: <p>{label} evidence</p>,
        }))}
      />
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    expect(screen.queryByText('Two evidence')).not.toBeInTheDocument();
    const move = (key: string, expected: number) => {
      fireEvent.keyDown(document.activeElement!, { key });
      expect(tabs[expected]).toHaveFocus();
      expect(tabs[expected]).toHaveAttribute('aria-selected', 'true');
      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveAttribute(
        'id',
        tabs[expected].getAttribute('aria-controls')
      );
      expect(panel).toHaveAttribute('aria-labelledby', tabs[expected].id);
    };
    tabs[0].focus();
    move('ArrowLeft', 2);
    move('ArrowRight', 0);
    move('End', 2);
    move('Home', 0);
    move('ArrowRight', 1);
    move('Escape', 1);
    fireEvent.click(tabs[2]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Three evidence');
    expect(screen.queryByText('Two evidence')).not.toBeInTheDocument();
  });

  it('keeps independent galleries separate and supports a single item', () => {
    render(
      <>
        <DemoTabs
          label="First"
          items={[{ label: 'Only', content: 'First capture' }]}
        />
        <DemoTabs
          label="Second"
          items={[{ label: 'Only', content: 'Second capture' }]}
        />
      </>
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-controls')).not.toBe(
      tabs[1].getAttribute('aria-controls')
    );
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(tabs[0]).toHaveFocus();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
  });
});
