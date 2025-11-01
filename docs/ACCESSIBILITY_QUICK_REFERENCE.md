# Accessibility Testing Quick Reference

Quick commands and code snippets for accessibility testing.

## Quick Commands

```bash
# Lint code for accessibility issues
npm run lint:fix

# Run all accessibility tests
npm run test:a11y

# Run accessibility tests with UI
npm run test:a11y:ui

# Debug accessibility tests
npm run test:a11y:debug

# Generate HTML report
npm run test:a11y:report
```

## Quick Test Examples

### Basic Test

```typescript
import { expectNoA11yViolations } from './utils/a11y-helper';

test('homepage accessibility', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
```

### WCAG 2.1 AA Test

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
    disableRules: ['color-contrast'],
    includeTags: ['wcag2aa'],
    excludeSelectors: ['.third-party'],
  });
  expect(results.violations).toHaveLength(0);
});
```

## Common ESLint Fixes

### Images

```tsx
// ❌ Bad
<img src="photo.jpg" />

// ✅ Good
<img src="photo.jpg" alt="Description" />

// ✅ Decorative
<img src="decoration.jpg" alt="" role="presentation" />
```

### Buttons

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### Links

```tsx
// ❌ Bad
<a href="#">Learn more</a>

// ✅ Good
<a href="/about">Learn more about our services</a>
```

### Form Labels

```tsx
// ❌ Bad
<input type="text" />

// ✅ Good
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

### Interactive Elements

```tsx
// ❌ Bad
<div onClick={handleClick}>Action</div>

// ✅ Good
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Action
</div>
```

## WCAG Compliance Levels

| Level | Tags                                                                    |
| ----- | ----------------------------------------------------------------------- |
| A     | `['wcag2a', 'wcag21a']`                                                 |
| AA    | `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`                          |
| AAA   | `['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa']` |

## Common axe-core Rules

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

## Helper Functions

| Function                   | Use Case             |
| -------------------------- | -------------------- |
| `expectNoA11yViolations()` | Assert no violations |
| `checkA11y()`              | Get full results     |
| `getA11yReport()`          | Get formatted report |
| `checkWCAG21AA()`          | Test AA compliance   |

## Testing Checklist

- [ ] Run `npm run lint:fix` before commit
- [ ] Run `npm run test:a11y` before push
- [ ] Test keyboard navigation manually
- [ ] Check color contrast (4.5:1 for text)
- [ ] Verify focus indicators are visible
- [ ] Test with screen reader
- [ ] Test at 200% zoom
- [ ] Test on mobile devices

## Resources

- 📚 [Full Documentation](./ACCESSIBILITY_TESTING.md)
- 🔧 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- 🌐 [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- 📖 [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
