import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const bootstrapScriptMatch = indexHtml.match(
  /<!-- Apply persisted theme attributes before React mounts -->\s*<script>\s*([\s\S]*?)\s*<\/script>/
);

if (!bootstrapScriptMatch) {
  throw new Error('Expected to find the theme bootstrap script in index.html');
}

const bootstrapScript = bootstrapScriptMatch[1];

function installMatchMediaMock(isDark: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(
      (query: string): MediaQueryList => ({
        matches: query === '(prefers-color-scheme: dark)' ? isDark : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      })
    ),
  });
}

function runBootstrapScript(): void {
  const executeBootstrap = new Function(bootstrapScript);
  executeBootstrap();
}

describe('index.html theme bootstrap', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-mode');
    document.documentElement.setAttribute('style', '');
    document.body.style.backgroundColor = '';
    window.history.pushState({}, '', '/');
    installMatchMediaMock(false);
  });

  it('defaults to the minimal theme and system-resolved mode', () => {
    runBootstrapScript();

    expect(document.documentElement.dataset.theme).toBe('minimal');
    expect(document.documentElement.dataset.colorMode).toBe('light');
    expect(document.documentElement.style.getPropertyValue('--bg-main')).toBe(
      '#f7f7f5'
    );
  });

  it('prefers query params over stored theme and mode', () => {
    localStorage.setItem('portfolio-theme', 'engineer');
    localStorage.setItem('portfolio-color-mode', 'dark');
    window.history.pushState({}, '', '/?theme=cosmic&mode=light');

    runBootstrapScript();

    expect(document.documentElement.dataset.theme).toBe('cosmic');
    expect(document.documentElement.dataset.colorMode).toBe('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('cosmic');
    expect(localStorage.getItem('portfolio-color-mode')).toBe('light');
    expect(document.documentElement.style.getPropertyValue('--bg-main')).toBe(
      '#fdf8ff'
    );
  });

  it('restores a persisted current theme before first paint', () => {
    localStorage.setItem('portfolio-theme', 'cli');
    localStorage.setItem('portfolio-color-mode', 'system');
    installMatchMediaMock(true);

    runBootstrapScript();

    expect(document.documentElement.dataset.theme).toBe('cli');
    expect(document.documentElement.dataset.colorMode).toBe('dark');
    expect(document.documentElement.style.getPropertyValue('--bg-main')).toBe(
      '#0a0f0a'
    );
  });
});
