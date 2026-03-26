import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function BaseIcon({
  children,
  size = 24,
  strokeWidth = 2,
  ...props
}: IconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </BaseIcon>
  );
}

export function MonitorIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16v4" />
    </BaseIcon>
  );
}

export function MoonIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </BaseIcon>
  );
}

export function PaletteIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.25a2.75 2.75 0 0 0 0-5.5h-.44A2.31 2.31 0 0 1 10.5 13a2.5 2.5 0 0 1 2.5-2.5H15A6 6 0 0 0 15 3h-3Z" />
      <circle cx="7.5" cy="10.5" r=".75" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7.5" r=".75" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="7.5" r=".75" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r=".75" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

export function SunIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </BaseIcon>
  );
}

export function BrainIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M9 3a3 3 0 0 0-3 3v1a2.5 2.5 0 0 0-2 2.45A2.5 2.5 0 0 0 6 11.9V13a3 3 0 0 0 3 3h.5v3" />
      <path d="M15 3a3 3 0 0 1 3 3v1a2.5 2.5 0 0 1 2 2.45 2.5 2.5 0 0 1-2 2.45V13a3 3 0 0 1-3 3h-.5v3" />
      <path d="M9 8h1.5" />
      <path d="M13.5 8H15" />
      <path d="M9.5 12H12" />
      <path d="M12 5.5V21" />
    </BaseIcon>
  );
}

export function BookOpenIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12 7v14" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H12v16H7.5A2.5 2.5 0 0 0 5 21.5Z" />
      <path d="M19 5.5A2.5 2.5 0 0 0 16.5 3H12v16h4.5A2.5 2.5 0 0 1 19 21.5Z" />
    </BaseIcon>
  );
}

export function BoneIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 2.3 1.5l6.4 6.4a2.5 2.5 0 0 1 3.8 3.2 2.5 2.5 0 1 1-3.5 3.5 2.5 2.5 0 0 1-3.2-3.8L5.9 7.8A2.5 2.5 0 0 1 2.7 6a2.5 2.5 0 0 1 3.8 2.5Z" />
    </BaseIcon>
  );
}

export function HandIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M7 11V5a1 1 0 1 1 2 0v6" />
      <path d="M10 11V4a1 1 0 1 1 2 0v7" />
      <path d="M13 11V5a1 1 0 1 1 2 0v6" />
      <path d="M16 12V8a1 1 0 1 1 2 0v6a5 5 0 0 1-5 5h-2.2a4.8 4.8 0 0 1-3.4-1.4L4 14.2a1.2 1.2 0 1 1 1.7-1.7L8 14.8V11a1 1 0 1 1 2 0" />
    </BaseIcon>
  );
}

export function PawPrintIcon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="7.5" cy="8" r="1.6" />
      <circle cx="12" cy="6.5" r="1.6" />
      <circle cx="16.5" cy="8" r="1.6" />
      <path d="M12 12c-2.6 0-4.8 1.8-4.8 4 0 1.7 1.4 3 3.1 3 .9 0 1.6-.4 2.2-1 .6.6 1.3 1 2.2 1 1.7 0 3.1-1.3 3.1-3 0-2.2-2.2-4-5.8-4Z" />
    </BaseIcon>
  );
}
