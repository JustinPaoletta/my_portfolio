# Accessibility Contract

This portfolio targets WCAG 2.2 AA across every supported theme and both explicit color modes (`light` and `dark`).

## Automated Gates

- `eslint-plugin-jsx-a11y` enforces baseline semantic rules in source.
- `npm run contrast:check` validates light and dark theme token pairs, including focus-indicator contrast.
- `npm run test:a11y:unit` runs axe-backed component tests against the app shell and custom interactive UI.
- `npm run test:e2e -- --project=chromium` covers runtime keyboard and focus behavior, including the tagged `@a11y` browser tests.
- `npm run lighthouse` enforces an accessibility score of `1.00` for every `theme + light/dark` combination.

## Review Checklist

- Every interactive control has a correct native element before any ARIA is added.
- Keyboard users can open, use, and dismiss dialogs/drawers without losing focus.
- Skip navigation moves real focus to the main content target.
- Custom tabs, pickers, and command UIs expose the expected focus order and selected state.
- Form errors are field-specific, tied with `aria-describedby`, and focus the first invalid control.
- Success feedback uses `role="status"` and error feedback uses `role="alert"`.
- Reduced-motion users get a non-animated fallback for the cosmic hero experience.

## Manual Smoke Pass

- VoiceOver + Safari: verify skip link, mobile menu, theme switcher, contact form errors, and CLI command input.
- Keyboard only: tab through the shell, open/close the mobile menu, open/close the theme switcher, switch skills tabs, submit an invalid contact form, and run a CLI command.
- Theme matrix: spot-check `engineer`, `cosmic`, `cli`, and `minimal` in both `light` and `dark` mode.

## Useful Commands

```bash
npm run contrast:check
npm run test:a11y:unit
npm run test:a11y:e2e
npm run lighthouse
```
