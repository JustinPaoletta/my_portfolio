# Accessibility Testing Guide

This document provides a comprehensive guide to the automated accessibility testing setup for this project.

## Table of Contents

- [Overview](#overview)
- [Tools](#tools)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [ESLint Accessibility Linting](#eslint-accessibility-linting)
- [E2E Accessibility Testing](#e2e-accessibility-testing)
- [Helper Utilities](#helper-utilities)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## Overview

This project uses a multi-layered approach to accessibility testing:

1. **Static Analysis**: ESLint with `eslint-plugin-jsx-a11y` catches accessibility issues during development
2. **Automated E2E Testing**: Playwright with `@axe-core/playwright` validates accessibility in a real browser environment

This combination ensures both code-level and runtime accessibility compliance.

## Tools

### 1. eslint-plugin-jsx-a11y

A static analysis tool that checks your React JSX for accessibility issues during development and in your CI/CD pipeline.

**What it catches:**

- Missing alt text on images
- Invalid ARIA attributes
- Missing labels on form controls
- Keyboard accessibility issues
- Semantic HTML violations

### 2. @axe-core/playwright

A runtime accessibility testing library that integrates axe-core with Playwright to test your application in real browsers.

**What it tests:**

- WCAG 2.0/2.1 compliance (Level A, AA, AAA)
- Color contrast
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Semantic HTML structure

## Getting Started

All dependencies are already installed. The configuration includes:

- ✅ `@axe-core/playwright` - E2E accessibility testing
- ✅ `eslint-plugin-jsx-a11y` - React accessibility linting
- ✅ Helper utilities for easier testing
- ✅ Example tests demonstrating best practices

## Running Tests

### Accessibility Tests (E2E)

```bash
# Run all accessibility tests
npm run test:a11y

# Run with UI mode (visual test runner)
npm run test:a11y:ui

# Debug accessibility tests
npm run test:a11y:debug

# Generate HTML report
npm run test:a11y:report
```

### All E2E Tests (including accessibility)

```bash
# Run all Playwright tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

### Linting (includes accessibility checks)

```bash
# Check for linting issues (CI mode)
npm run lint:ci

# Fix linting issues automatically
npm run lint:fix
```

## ESLint Accessibility Linting

The ESLint configuration includes comprehensive accessibility rules from `eslint-plugin-jsx-a11y`.

### Key Rules Enabled

| Rule                                    | Description                                 | Level |
| --------------------------------------- | ------------------------------------------- | ----- |
| `jsx-a11y/alt-text`                     | Requires alt text for images                | error |
| `jsx-a11y/anchor-is-valid`              | Ensures anchors are valid                   | error |
| `jsx-a11y/aria-props`                   | Validates ARIA properties                   | error |
| `jsx-a11y/aria-proptypes`               | Validates ARIA property types               | error |
| `jsx-a11y/click-events-have-key-events` | Requires keyboard handlers for click events | error |
| `jsx-a11y/heading-has-content`          | Ensures headings have content               | error |
| `jsx-a11y/html-has-lang`                | Requires lang attribute on html             | error |
| `jsx-a11y/label-has-associated-control` | Labels must be associated with controls     | error |
| `jsx-a11y/no-autofocus`                 | Warns against autofocus                     | warn  |

### Example Violations and Fixes

#### ❌ Missing Alt Text

```tsx
// Bad
<img src="profile.jpg" />

// Good
<img src="profile.jpg" alt="User profile photo" />
```

#### ❌ Click Without Keyboard Handler

```tsx
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>

// Or with div (if necessary)
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

#### ❌ Missing Label

```tsx
// Bad
<input type="text" />

// Good
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// Or with aria-label
<input type="text" aria-label="Username" />
```

## E2E Accessibility Testing

### Test Structure

Tests are organized in `e2e/accessibility.spec.ts` and cover:

1. **Homepage Accessibility** - General accessibility checks
2. **Keyboard Navigation** - Focus management and keyboard support
3. **Color Contrast** - WCAG color contrast requirements
4. **Semantic HTML** - Proper HTML structure and landmarks
5. **Images and Media** - Alt text and media accessibility
6. **Forms** - Form control labeling (when applicable)
7. **Mobile Accessibility** - Touch target sizes and mobile-specific issues

### Using Helper Utilities

The project includes a comprehensive helper utility at `e2e/utils/a11y-helper.ts`.

#### Basic Usage

```typescript
import { expectNoA11yViolations } from './utils/a11y-helper';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

#### WCAG Compliance Testing

```typescript
import { checkWCAG21AA } from './utils/a11y-helper';

test('should comply with WCAG 2.1 Level AA', async ({ page }) => {
  await page.goto('/');
  const results = await checkWCAG21AA(page);
  expect(results.violations).toHaveLength(0);
});
```

#### Custom Configuration

```typescript
import { checkA11y } from './utils/a11y-helper';

test('should pass with custom rules', async ({ page }) => {
  await page.goto('/');

  const results = await checkA11y(page, {
    disableRules: ['color-contrast'], // Temporarily disable
    includeTags: ['wcag2aa', 'best-practice'],
    excludeSelectors: ['.third-party-widget'], // Exclude specific elements
  });

  expect(results.violations).toHaveLength(0);
});
```

#### Generating Reports

```typescript
import { getA11yReport } from './utils/a11y-helper';

test('should generate an accessibility report', async ({ page }) => {
  await page.goto('/');

  const report = await getA11yReport(page);
  console.log('Accessibility Report:', JSON.stringify(report, null, 2));

  expect(report.violations).toBe(0);
});
```

## Helper Utilities

### Available Functions

| Function                                 | Description                                    |
| ---------------------------------------- | ---------------------------------------------- |
| `checkA11y(page, options?)`              | Runs axe-core scan with optional configuration |
| `expectNoA11yViolations(page, options?)` | Asserts no violations found                    |
| `getA11yReport(page, options?)`          | Returns formatted accessibility report         |
| `checkWCAG21AA(page, options?)`          | Tests WCAG 2.1 Level AA compliance             |

### Configuration Options

```typescript
interface A11yTestOptions {
  disableRules?: string[]; // Rules to disable
  includeTags?: string[]; // Tags to include (e.g., ['wcag2aa'])
  excludeTags?: string[]; // Tags to exclude
  excludeSelectors?: string[]; // CSS selectors to exclude
}
```

### WCAG Levels

```typescript
import { WCAGLevels } from './utils/a11y-helper';

// Available levels
WCAGLevels.A; // ['wcag2a', 'wcag21a']
WCAGLevels.AA; // ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
WCAGLevels.AAA; // All WCAG levels including AAA
```

## Best Practices

### 1. Test Early and Often

Run accessibility tests throughout development:

```bash
# Run tests in watch mode during development
npm run test:a11y:ui
```

### 2. Address Issues During Development

ESLint catches many issues before they reach production:

```bash
# Fix issues automatically where possible
npm run lint:fix
```

### 3. Test Multiple Viewports

```typescript
test('should be accessible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

### 4. Test Keyboard Navigation

```typescript
test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/');

  // Tab through interactive elements
  await page.keyboard.press('Tab');

  // Verify focus is visible
  const focusedElement = await page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});
```

### 5. Test User Interactions

```typescript
test('should be accessible after interaction', async ({ page }) => {
  await page.goto('/');

  // Perform user action
  await page.click('button[aria-label="Open menu"]');

  // Check accessibility of new state
  await expectNoA11yViolations(page);
});
```

### 6. Use Semantic HTML

```tsx
// Good - Semantic HTML
<header>
  <nav>
    <ul>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Page Title</h1>
    <p>Content here</p>
  </article>
</main>

<footer>
  <p>Copyright 2025</p>
</footer>
```

### 7. Provide Text Alternatives

```tsx
// Images
<img src="logo.png" alt="Company Logo" />

// Icons
<button aria-label="Close dialog">
  <CloseIcon aria-hidden="true" />
</button>

// Decorative images
<img src="decoration.png" alt="" role="presentation" />
```

### 8. Ensure Keyboard Accessibility

```tsx
// Button (automatically keyboard accessible)
<button onClick={handleClick}>Submit</button>

// Custom interactive element
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

### 9. Use ARIA Appropriately

```tsx
// Use native HTML when possible
<button>Click me</button> // Better than <div role="button">

// Use ARIA to enhance semantics
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

// Provide state information
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>

<div id="menu" role="menu" hidden={!isOpen}>
  Menu items
</div>
```

### 10. Test with Real Users

Automated testing catches ~30-50% of accessibility issues. Always test with:

- Keyboard-only navigation
- Screen readers (NVDA, JAWS, VoiceOver)
- Browser zoom (200%+)
- Color blindness simulators
- Real users with disabilities

## Troubleshooting

### Common Issues

#### 1. Color Contrast Violations

**Problem**: Text doesn't have sufficient contrast with background.

**Solution**:

- Use a contrast ratio of at least 4.5:1 for normal text
- Use a contrast ratio of at least 3:1 for large text (18pt+ or 14pt+ bold)
- Use online tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### 2. Missing Form Labels

**Problem**: Input fields don't have associated labels.

**Solution**:

```tsx
// Explicit label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Implicit label
<label>
  Email
  <input type="email" />
</label>

// ARIA label (when visual label isn't desired)
<input type="email" aria-label="Email address" />
```

#### 3. Invalid ARIA Usage

**Problem**: Using invalid ARIA attributes or roles.

**Solution**:

- Consult the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- Use semantic HTML instead of ARIA when possible
- Validate ARIA with the ESLint plugin

#### 4. Keyboard Trap

**Problem**: Users can't escape a component using keyboard.

**Solution**:

```tsx
// Ensure Escape key closes modals
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []);
```

#### 5. Focus Management

**Problem**: Focus isn't properly managed in SPAs.

**Solution**:

```tsx
// Focus first heading on route change
useEffect(() => {
  const heading = document.querySelector('h1');
  heading?.focus();
}, [location]);

// Set tabindex="-1" on headings to make them focusable
<h1 tabIndex={-1}>Page Title</h1>;
```

### Disabling Rules Temporarily

Sometimes you need to temporarily disable a rule while fixing issues:

```typescript
// In tests
const results = await checkA11y(page, {
  disableRules: ['color-contrast'], // Fix this ASAP!
});

// In ESLint (use sparingly)
// eslint-disable-next-line jsx-a11y/click-events-have-key-events
<div onClick={handleClick}>Click</div>
```

**⚠️ Always document why a rule is disabled and create a ticket to fix it!**

## Resources

### Official Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [eslint-plugin-jsx-a11y Rules](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)
- [Screen Reader Testing](https://www.nvaccess.org/download/) (NVDA - free)

### Learning Resources

- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [WebAIM Articles](https://webaim.org/articles/)

### Communities

- [A11y Slack](https://web-a11y.slack.com/)
- [WebAIM Discussion List](https://webaim.org/discussion/)
- [Accessibility on Twitter](https://twitter.com/hashtag/a11y)

## Continuous Improvement

Accessibility is an ongoing process. Here's how to maintain and improve:

1. **Run tests in CI/CD** - Fail builds on accessibility violations
2. **Regular audits** - Conduct manual audits quarterly
3. **User feedback** - Gather feedback from users with disabilities
4. **Training** - Educate team members on accessibility best practices
5. **Documentation** - Keep this guide updated with new learnings

---

**Remember**: Automated testing catches 30-50% of issues. Manual testing and user feedback are essential for comprehensive accessibility.

For questions or issues, please refer to the project's README or create an issue in the repository.
