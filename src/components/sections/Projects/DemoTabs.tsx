import { useId, useRef, useState, type ReactNode } from 'react';

interface DemoTabsProps {
  label: string;
  items: { label: string; content: ReactNode }[];
}

/** Small, keyboard-accessible switcher for captured project evidence. */
export function DemoTabs({ label, items }: DemoTabsProps): React.ReactElement {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <div className="project-showcase" role="group" aria-label={label}>
      <div className="demo-tabs" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.label}
            ref={(button) => {
              buttons.current[index] = button;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={selected === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === 'ArrowRight') next = (index + 1) % items.length;
              else if (event.key === 'ArrowLeft')
                next = (index + items.length - 1) % items.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = items.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              buttons.current[next]?.focus();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.label}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          tabIndex={0}
          hidden={selected !== index}
        >
          {selected === index ? item.content : null}
        </div>
      ))}
    </div>
  );
}
