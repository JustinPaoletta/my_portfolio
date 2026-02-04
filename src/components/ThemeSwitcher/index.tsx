/**
 * ThemeSwitcher Component
 * Provides UI to switch between different color themes and dark/light modes
 */

import React, { useState, useCallback } from 'react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorMode } from '@/config/themes';
import './ThemeSwitcher.css';

const modeIcons: Record<ColorMode, React.ReactElement> = {
  light: <Sun size={20} aria-hidden />,
  dark: <Moon size={20} aria-hidden />,
  system: <Monitor size={20} aria-hidden />,
};

const modeLabels: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export default function ThemeSwitcher(): React.ReactElement {
  const { themeName, setTheme, themes, colorMode, setColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleThemeSelect = useCallback(
    (name: string) => {
      setTheme(name);
    },
    [setTheme]
  );

  const handleModeSelect = useCallback(
    (mode: ColorMode) => {
      setColorMode(mode);
    },
    [setColorMode]
  );

  const handleThemeKeyDown = useCallback(
    (event: React.KeyboardEvent, name: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleThemeSelect(name);
      }
    },
    [handleThemeSelect]
  );

  const handleModeKeyDown = useCallback(
    (event: React.KeyboardEvent, mode: ColorMode) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleModeSelect(mode);
      }
    },
    [handleModeSelect]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={`theme-switcher ${isOpen ? 'open' : ''}`}>
      <button
        className="theme-switcher-toggle"
        onClick={toggleOpen}
        onMouseEnter={() => {}}
        onFocus={() => {}}
        aria-label="Toggle theme switcher"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className="theme-icon" aria-hidden="true">
          <Palette size={20} />
        </span>
        <span className="theme-label">Theme</span>
      </button>

      {isOpen && (
        <>
          <div
            className="theme-switcher-backdrop"
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            role="presentation"
          />
          <div
            className="theme-switcher-menu"
            role="dialog"
            aria-label="Theme settings"
          >
            {/* Color Mode Section - Minimal toggle */}
            <div
              className="mode-toggle"
              role="radiogroup"
              aria-label="Color mode"
            >
              {(['light', 'dark', 'system'] as ColorMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`mode-toggle-btn ${colorMode === mode ? 'active' : ''}`}
                  onClick={() => handleModeSelect(mode)}
                  onKeyDown={(e) => handleModeKeyDown(e, mode)}
                  role="radio"
                  aria-checked={colorMode === mode}
                  aria-label={modeLabels[mode]}
                  title={modeLabels[mode]}
                >
                  <span aria-hidden="true">{modeIcons[mode]}</span>
                </button>
              ))}
            </div>

            {/* Theme Section */}
            <div className="theme-section">
              <div className="theme-section-label">Theme</div>
              <div role="listbox" aria-label="Select a theme">
                {Object.values(themes).map((theme) => (
                  <button
                    key={theme.name}
                    className={`theme-option ${themeName === theme.name ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(theme.name)}
                    onKeyDown={(e) => handleThemeKeyDown(e, theme.name)}
                    role="option"
                    aria-selected={themeName === theme.name}
                  >
                    <span
                      className="theme-swatch"
                      style={{ backgroundColor: theme.colors.primary }}
                      aria-hidden="true"
                    />
                    <span className="theme-option-label">{theme.label}</span>
                    {themeName === theme.name && (
                      <span className="theme-check" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
