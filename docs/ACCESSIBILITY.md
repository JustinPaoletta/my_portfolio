# ♿ Accessibility Guide

This project uses automated accessibility testing to ensure WCAG 2.1 Level AA compliance. This guide explains how to use the testing tools and maintain accessible code.

## 🚀 Quick Start

### Running Tests

```bash
# Run all accessibility tests
npm run test:a11y

# Run with visual UI (recommended for development)
npm run test:a11y:ui

# Debug accessibility tests
npm run test:a11y:debug

# Generate HTML report
npm run test:a11y:report

# Fix linting issues automatically
npm run lint:fix

# Check for linting issues (CI mode)
npm run lint:ci
```

### Basic Test Example

```typescript
import { expectNoA11yViolations } from './utils/a11y-helper';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

## 🔧 How It's Configured

### Tools

1. **ESLint (`eslint-plugin-jsx-a11y`)** - Catches accessibility issues during development
2. **Playwright + axe-core** - Runtime testing in real browsers

### Project Structure

- **`e2e/accessibility.spec.ts`** - E2E accessibility test suite
- **`e2e/utils/a11y-helper.ts`** - Helper utilities for testing
- **`eslint.config.js`** - Includes jsx-a11y rules

### Helper Functions

| Function                   | Use Case                          |
| -------------------------- | --------------------------------- |
| `expectNoA11yViolations()` | Assert no violations found        |
| `checkA11y()`              | Get full test results             |
| `getA11yReport()`          | Get formatted report              |
| `checkWCAG21AA()`          | Test WCAG 2.1 Level AA compliance |

## 📝 Common Code Patterns

### Images

```tsx
// ❌ Bad - Missing alt text
<img src="photo.jpg" />

// ✅ Good - Descriptive alt text
<img src="photo.jpg" alt="User profile photo showing person smiling" />

// ✅ Decorative images
<img src="decoration.jpg" alt="" role="presentation" />
```

### Buttons and Interactive Elements

```tsx
// ❌ Bad - Div with click handler
<div onClick={handleClick}>Click me</div>

// ✅ Good - Semantic button
<button onClick={handleClick}>Click me</button>

// ✅ If you must use div (rarely needed)
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
  Click me
</div>
```

### Links

```tsx
// ❌ Bad - Empty or placeholder href
<a href="#">Learn more</a>

// ✅ Good - Descriptive link with proper href
<a href="/about">Learn more about our services</a>
```

### Form Labels

```tsx
// ❌ Bad - Unlabeled input
<input type="text" />

// ✅ Good - Explicit label
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Good - Implicit label
<label>
  Name
  <input type="text" />
</label>

// ✅ Good - ARIA label (when visual label isn't desired)
<input type="text" aria-label="Email address" />
```

### Mouse Events (Your Project Requirement)

```tsx
// ❌ Bad - Missing keyboard handler
<button onMouseOver={handleHover}>Hover me</button>

// ✅ Good - Has both mouse and keyboard handlers
<button
  onMouseOver={handleHover}
  onFocus={handleHover}
  onMouseOut={handleLeave}
  onBlur={handleLeave}
>
  Hover me
</button>
```

## 🧪 Testing

### WCAG Compliance Testing

```typescript
import { checkWCAG21AA } from './utils/a11y-helper';

test('WCAG 2.1 AA compliance', async ({ page }) => {
  await page.goto('/');
  const results = await checkWCAG21AA(page);
  expect(results.violations).toHaveLength(0);
});
```

### Custom Configuration

```typescript
import { checkA11y } from './utils/a11y-helper';

test('custom accessibility rules', async ({ page }) => {
  await page.goto('/');
  const results = await checkA11y(page, {
    disableRules: ['color-contrast'], // Temporarily disable
    includeTags: ['wcag2aa'],
    excludeSelectors: ['.third-party-widget'],
  });
  expect(results.violations).toHaveLength(0);
});
```

### Testing After Interactions

```typescript
test('should be accessible after interaction', async ({ page }) => {
  await page.goto('/');

  // Perform user action
  await page.click('button[aria-label="Open menu"]');

  // Check accessibility of new state
  await expectNoA11yViolations(page);
});
```

### Mobile Testing

```typescript
test('should be accessible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

### Keyboard Navigation Testing

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

## 📊 WCAG Compliance Levels

| Level | Tags                                                                    |
| ----- | ----------------------------------------------------------------------- |
| A     | `['wcag2a', 'wcag21a']`                                                 |
| AA    | `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`                          |
| AAA   | `['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa']` |

## 🎯 Best Practices

### 1. Use Semantic HTML

```tsx
// ✅ Good - Semantic HTML
<header>
  <nav aria-label="Main navigation">
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

### 2. Provide Text Alternatives

```tsx
// Images
<img src="logo.png" alt="Company Logo" />

// Icon buttons
<button aria-label="Close dialog">
  <CloseIcon aria-hidden="true" />
</button>

// Decorative images
<img src="decoration.png" alt="" role="presentation" />
```

### 3. Ensure Keyboard Accessibility

- All interactive elements must be keyboard accessible
- Use semantic buttons (`<button>`) when possible
- If using custom elements, add `role`, `tabIndex`, and keyboard handlers
- Ensure focus indicators are visible

### 4. Color Contrast

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify

### 5. Focus Management

```tsx
// Focus first heading on route change
useEffect(() => {
  const heading = document.querySelector('h1');
  heading?.focus();
}, [location]);

// Make headings focusable
<h1 tabIndex={-1}>Page Title</h1>;
```

### 6. ARIA Usage

```tsx
// ✅ Use native HTML when possible
<button>Click me</button> // Better than <div role="button">

// ✅ Use ARIA to enhance semantics
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

// ✅ Provide state information
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>
```

### 7. Test Regularly

- Run `npm run lint:fix` before committing
- Run `npm run test:a11y` before pushing
- Test keyboard navigation manually
- Test with screen readers
- Test at 200% zoom
- Test on mobile devices

## 🚨 Common Issues & Solutions

### Color Contrast Violations

**Problem**: Text doesn't have sufficient contrast with background.

**Solution**: Use contrast ratio of at least 4.5:1 for normal text, 3:1 for large text. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### Missing Form Labels

**Problem**: Input fields don't have associated labels.

**Solution**: Always associate labels with inputs using `htmlFor` or implicit labels. Use `aria-label` if visual label isn't desired.

### Keyboard Trap

**Problem**: Users can't escape a component using keyboard.

**Solution**: Ensure Escape key closes modals and manage focus properly:

```tsx
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

### ESLint Accessibility Errors

**Problem**: ESLint catches accessibility violations during development.

**Solution**: Run `npm run lint:fix` to automatically fix many issues. For others, consult the error message and fix manually.

## 📋 Testing Checklist

Before committing code:

- [ ] Run `npm run lint:fix` - Fixes automatic issues
- [ ] Run `npm run test:a11y` - Verify no violations
- [ ] Test keyboard navigation manually
- [ ] Check color contrast (4.5:1 minimum)
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader (optional but recommended)
- [ ] Test at 200% zoom
- [ ] Test on mobile devices

## 📚 Common axe-core Rules

| Rule ID             | Description                   |
| ------------------- | ----------------------------- |
| `color-contrast`    | Text has sufficient contrast  |
| `image-alt`         | Images have alt text          |
| `label`             | Form elements have labels     |
| `button-name`       | Buttons have accessible names |
| `link-name`         | Links have accessible names   |
| `html-has-lang`     | HTML has lang attribute       |
| `landmark-one-main` | Page has main landmark        |
| `region`            | Content is in landmarks       |

## 🔗 Resources

### Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [Lighthouse (Chrome DevTools)](https://developers.google.com/web/tools/lighthouse)

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Learning

- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)
- [WebAIM Articles](https://webaim.org/articles/)

## ⚠️ Important Notes

1. **Automated testing catches ~30-50% of issues** - Manual testing and user feedback are essential
2. **Always test with real users** - Especially users with disabilities
3. **Never disable rules permanently** - If you must disable a rule temporarily, document why and create a ticket to fix it
4. **Accessibility is not optional** - It's a legal requirement in many jurisdictions and the right thing to do

---

**Remember**: Accessibility benefits everyone. Making your site accessible improves usability for all users, not just those with disabilities.
