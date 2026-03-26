# Accessibility Manual Test Guide

Use this checklist to manually verify the portfolio's accessibility contract after major UI, theme, or interaction changes.

## Recommended Test Setup

Use the production preview first because it exercises the real build, contrast gate, and prerender path.

```bash
cd /path/to/my_portfolio
npm install
npm run start:prod
```

Open:

- `http://localhost:4173/`

For fast iteration during spot checks, you can also use:

```bash
npm run start:dev
```

## Browsers and Assistive Tech

Recommended manual matrix:

- Safari + VoiceOver on macOS
- Chrome keyboard-only pass
- Chrome with reduced motion enabled
- Chrome or Safari at `200%` zoom
- Optional: Windows + NVDA + Chrome if available

## Pass/Fail Rule

Mark a test as failed if any of these happen:

- focus disappears or is hard to see
- keyboard users get trapped or cannot reach or close UI
- a screen reader announces the wrong role, name, or state
- content becomes clipped, overlapped, or unusable at zoom
- validation or status changes are visible but not announced
- dark mode or alternate themes break contrast or focus visibility

## 1. Keyboard-Only Baseline

Load `/` and do not use the mouse.

### Skip Link

1. Press `Tab` on first load.
2. Confirm `Skip to main content` becomes visible.
3. Press `Enter`.

Expected:

- focus lands on the main content area
- the page does not leave focus on the skip link
- focus indicator remains visible

### Desktop Navigation

1. Resize wide enough for desktop nav.
2. Tab through the nav links.
3. Activate `About`, `Projects`, `Skills`, and `Contact`.

Expected:

- each item is a normal link, not a fake menu widget
- activated links move to the correct section
- the destination section receives focus or the user clearly lands at the target
- the current section link exposes an active state visually

### Mobile Menu Drawer

1. Switch to a narrow/mobile viewport.
2. Open the menu with the hamburger button.
3. Press `Tab` repeatedly.
4. Press `Shift+Tab` repeatedly.
5. Press `Escape`.

Expected:

- the drawer is announced as a dialog
- focus moves into the drawer when it opens
- focus stays trapped inside while open
- `Escape` closes it
- focus returns to the menu trigger after close
- background content is not accidentally focusable while open

## 2. Theme Switcher

### Dialog Behavior

1. Open the floating theme switcher.
2. Confirm focus moves into the dialog.
3. Tab through color mode and theme choices.
4. Press `Escape`.

Expected:

- it is announced as a dialog
- the current radio option is focused first
- controls behave like native radio groups
- `Escape` closes the dialog
- focus returns to the toggle button

### Theme Matrix

Manually test these URLs:

- `http://localhost:4173/?theme=engineer&mode=light`
- `http://localhost:4173/?theme=engineer&mode=dark`
- `http://localhost:4173/?theme=cosmic&mode=light`
- `http://localhost:4173/?theme=cosmic&mode=dark`
- `http://localhost:4173/?theme=minimal&mode=light`
- `http://localhost:4173/?theme=minimal&mode=dark`
- `http://localhost:4173/?theme=cli&mode=light`
- `http://localhost:4173/?theme=cli&mode=dark`

Expected:

- text remains readable in every theme and mode
- focus rings are visible on buttons, links, inputs, and radios
- there are no invisible controls caused by theme token changes

## 3. Skills Tabs

Go to the Skills section.

1. Tab to the tablist.
2. Use `ArrowRight` and `ArrowLeft`.
3. Use `Home` and `End`.
4. Confirm only one tab is in the normal tab order at a time.

Expected:

- tabs announce correctly as tabs
- the active tab exposes selected state
- arrow keys move between tabs
- `Home` jumps to the first tab
- `End` jumps to the last tab
- only the active panel is exposed as the visible/current panel

## 4. Contact Form

### Client Validation

1. Submit the form empty.
2. Submit with:
   - invalid email
   - too-short message
   - missing name
3. Correct the fields and resubmit.

Expected:

- focus moves to the first invalid field
- invalid fields expose an error state
- each field is associated with its own error text
- success uses a polite status message
- failures use an alert-style error only when appropriate

### Keyboard Flow

Expected:

- labels are announced correctly
- all controls are reachable in a logical order
- no custom widget behavior interferes with text input

## 5. CLI Theme

Open the CLI theme from the theme switcher.

Test:

1. Tab into the CLI controls.
2. Move between command options and the input.
3. Trigger available actions using the keyboard.

Expected:

- the terminal container is not announced as one giant button
- the input has helpful instructions attached
- options expose selected or pressed state correctly
- the log or status behavior is understandable to assistive tech

## 6. Screen Reader Pass

Use VoiceOver with Safari if possible.

### Landmarks and Headings

Expected:

- there is one main landmark
- navigation is announced as navigation
- dialog surfaces are announced as dialogs
- heading order is logical

### Navigation and Dialogs

Expected:

- mobile menu announces as `Main menu` dialog
- theme switcher announces as `Theme settings` dialog
- closing either dialog returns focus to the invoking button

### Tabs and Form Errors

Expected:

- Skills controls are announced as tabs with selected state
- contact errors are announced when fields become invalid
- successful submission is announced without being overly disruptive

## 7. Reduced Motion

Enable `Reduce motion` in macOS accessibility settings or emulate it in browser devtools.

Visit:

- `http://localhost:4173/?theme=cosmic&mode=light`

Expected:

- the cosmic theme shows the still or fallback presentation
- motion-heavy effects are reduced or removed
- content remains fully usable

## 8. Zoom and Reflow

Test at:

- `200%` browser zoom
- `400%` browser zoom on the main flows if possible

Check:

- top navigation
- mobile menu
- theme switcher dialog
- Skills tabs
- Contact form
- CLI theme

Expected:

- no clipped text
- no overlapping controls
- dialogs remain usable
- horizontal scrolling is minimized to areas where it is truly necessary

## 9. Focus Visibility Sweep

Do one final `Tab` sweep through the app in:

- `engineer/light`
- `minimal/dark`
- `cli/dark`

Expected:

- every interactive element has a clearly visible focus indicator
- focus color is still visible against the active background

## 10. Suggested Defect Template

When you find an issue, capture:

- page URL
- theme + mode
- browser + assistive tech
- keyboard steps to reproduce
- expected behavior
- actual behavior
- screenshot or screen recording

## Quick Sign-Off

You can consider the manual pass acceptable if all of these are true:

- keyboard-only navigation works start to finish
- dialogs trap and restore focus correctly
- tabs behave like tabs
- form validation is both visible and announced
- reduced-motion fallback works
- no major contrast or focus-visibility regressions appear across themes
