/**
 * ThemeSwitcher Component
 * Provides UI to switch between different color themes and dark/light modes
 */

import React, { useState, useCallback, useEffect, useId, useRef } from 'react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorMode } from '@/config/themes';
import {
  getFocusableElements,
  temporarilyInertElements,
  trapFocusWithin,
} from '@/utils/accessibility';
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

const colorModes: ColorMode[] = ['light', 'dark', 'system'];

interface ThemeSwitcherProps {
  placement?: 'floating' | 'nav';
}

export default function ThemeSwitcher({
  placement = 'floating',
}: ThemeSwitcherProps): React.ReactElement {
  const { themeName, setTheme, themes, colorMode, setColorMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [pulseOnLoad, setPulseOnLoad] = useState(placement === 'floating');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const shouldRestoreFocus = useRef(true);
  const dialogId = useId();
  const dialogTitleId = useId();
  const colorModeName = `${dialogId}-color-mode`;
  const themeNameField = `${dialogId}-theme`;

  const closeMenu = useCallback((restoreFocus = true) => {
    shouldRestoreFocus.current = restoreFocus;
    setIsOpen(false);
  }, []);

  const toggleOpen = useCallback(() => {
    if (isOpen) {
      closeMenu(true);
      return;
    }

    shouldRestoreFocus.current = true;
    setIsOpen(true);
  }, [closeMenu, isOpen]);

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

  // Remove pulse-on-load class after animation completes
  useEffect(() => {
    if (!pulseOnLoad || placement !== 'floating') return;
    const toggle = toggleRef.current;
    if (!toggle) return;

    const handleAnimationEnd = (): void => {
      setPulseOnLoad(false);
    };

    toggle.addEventListener('animationend', handleAnimationEnd);
    return () => toggle.removeEventListener('animationend', handleAnimationEnd);
  }, [pulseOnLoad, placement]);

  // Close the menu when the user scrolls
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (): void => closeMenu(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const toggleButton = toggleRef.current;
    shouldRestoreFocus.current = true;

    const restoreInertState = temporarilyInertElements([
      document.querySelector<HTMLElement>('.skip-link'),
      document.querySelector<HTMLElement>('.navigation'),
      document.getElementById('main'),
      document.querySelector<HTMLElement>('footer'),
    ]);

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      trapFocusWithin(event, dialog);
    };

    const focusInitialControl = (): void => {
      const checkedInput = dialog.querySelector<HTMLInputElement>(
        'input[type="radio"]:checked'
      );

      if (checkedInput) {
        checkedInput.focus();
        return;
      }

      const [firstFocusable] = getFocusableElements(dialog);
      (firstFocusable ?? dialog).focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(focusInitialControl);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreInertState();

      if (shouldRestoreFocus.current) {
        toggleButton?.focus();
      }
    };
  }, [closeMenu, isOpen]);

  return (
    <div
      className={`theme-switcher theme-switcher--${placement} ${isOpen ? 'open' : ''}`}
    >
      <button
        ref={toggleRef}
        className={`theme-switcher-toggle ${pulseOnLoad ? 'pulse-on-load' : ''}`}
        onClick={toggleOpen}
        aria-label="Toggle theme switcher"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        type="button"
      >
        <span className="theme-icon" aria-hidden="true">
          <Palette size={20} />
        </span>
        <span className="theme-label">Theme</span>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="theme-switcher-backdrop"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => closeMenu(true)}
          />
          <div
            ref={dialogRef}
            id={dialogId}
            className="theme-switcher-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            tabIndex={-1}
          >
            <h2 id={dialogTitleId} className="visually-hidden">
              Theme settings
            </h2>

            <fieldset className="theme-section mode-toggle">
              <legend className="theme-section-label">Color Mode</legend>
              <div className="mode-toggle-options">
                {colorModes.map((mode) => {
                  const inputId = `${dialogId}-${mode}`;

                  return (
                    <div key={mode} className="theme-switcher-choice">
                      <input
                        id={inputId}
                        className="theme-switcher-radio-input"
                        type="radio"
                        name={colorModeName}
                        checked={colorMode === mode}
                        onChange={() => handleModeSelect(mode)}
                      />
                      <label
                        className={`mode-toggle-btn ${colorMode === mode ? 'active' : ''}`}
                        htmlFor={inputId}
                        title={modeLabels[mode]}
                      >
                        <span aria-hidden="true">{modeIcons[mode]}</span>
                        <span className="visually-hidden">
                          {modeLabels[mode]}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* Theme Section */}
            <fieldset className="theme-section">
              <legend className="theme-section-label">Theme</legend>
              <div className="theme-options">
                {Object.values(themes).map((theme) => (
                  <div key={theme.name} className="theme-switcher-choice">
                    <input
                      id={`${dialogId}-${theme.name}`}
                      className="theme-switcher-radio-input"
                      type="radio"
                      name={themeNameField}
                      checked={themeName === theme.name}
                      onChange={() => handleThemeSelect(theme.name)}
                    />
                    <label
                      className={`theme-option ${themeName === theme.name ? 'active' : ''}`}
                      htmlFor={`${dialogId}-${theme.name}`}
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
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </>
      )}
    </div>
  );
}
