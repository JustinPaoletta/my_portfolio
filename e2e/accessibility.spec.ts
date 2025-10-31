import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  expectNoA11yViolations,
  checkA11y,
  getA11yReport,
  checkWCAG21AA,
} from './utils/a11y-helper';

test.describe('Accessibility Tests', () => {
  test.describe('Homepage Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({
      page,
    }) => {
      await page.goto('/');

      // Use the helper to check for violations
      await expectNoA11yViolations(page);
    });

    test('should comply with WCAG 2.1 Level AA', async ({ page }) => {
      await page.goto('/');

      const results = await checkWCAG21AA(page);

      expect(results.violations).toHaveLength(0);
    });

    test('should have proper page structure', async ({ page }) => {
      await page.goto('/');

      // Check for specific accessibility features
      const results = await checkA11y(page, {
        includeTags: ['wcag2a'],
      });

      // Ensure there are no critical violations
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical'
      );
      expect(criticalViolations).toHaveLength(0);
    });

    test('should generate an accessibility report', async ({ page }) => {
      await page.goto('/');

      const report = await getA11yReport(page);

      // Log the report for visibility
      console.log('Accessibility Report:', JSON.stringify(report, null, 2));

      expect(report.violations).toBe(0);
      expect(report.passes).toBeGreaterThan(0);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow keyboard navigation through interactive elements', async ({
      page,
    }) => {
      await page.goto('/');

      // Check that interactive elements have proper focus management
      const results = await checkA11y(page, {
        includeTags: ['wcag2a', 'wcag2aa'],
      });

      // Check for keyboard-related violations
      const keyboardViolations = results.violations.filter(
        (v) =>
          v.id === 'interactive-supports-focus' ||
          v.id === 'focus-order-semantics'
      );

      expect(keyboardViolations).toHaveLength(0);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Get the first link (we know there are Vite and React links)
      const firstLink = page.locator('a').first();
      await expect(firstLink).toBeVisible();

      // Focus on it programmatically to test focus indicators
      await firstLink.focus();

      // Verify it has focus
      await expect(firstLink).toBeFocused();

      // Now test keyboard navigation
      const button = page.locator('button');
      await button.focus();
      await expect(button).toBeFocused();
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');

      const results = await checkA11y(page, {
        includeTags: ['wcag2aa'],
      });

      const contrastViolations = results.violations.filter(
        (v) => v.id === 'color-contrast'
      );

      expect(contrastViolations).toHaveLength(0);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use semantic HTML elements', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();

      // Should have at least one heading
      expect(headingCount).toBeGreaterThan(0);

      // Check for proper landmark regions
      const results = await checkA11y(page);

      const landmarkViolations = results.violations.filter(
        (v) => v.id === 'landmark-one-main' || v.id === 'region'
      );

      expect(landmarkViolations).toHaveLength(0);
    });

    test('should have proper document structure', async ({ page }) => {
      await page.goto('/');

      // Check for html lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBeTruthy();

      // Check for page title
      await expect(page).toHaveTitle(/.+/);
    });
  });

  test.describe('Images and Media', () => {
    test('should have alt text for images', async ({ page }) => {
      await page.goto('/');

      const results = await checkA11y(page);

      const imageViolations = results.violations.filter(
        (v) => v.id === 'image-alt' || v.id === 'image-redundant-alt'
      );

      expect(imageViolations).toHaveLength(0);
    });
  });

  test.describe('Forms (if applicable)', () => {
    test.skip('should have properly labeled form controls', async ({
      page,
    }) => {
      // Skip if your app doesn't have forms
      // Remove .skip and implement when you have forms
      await page.goto('/');

      const results = await checkA11y(page);

      const formViolations = results.violations.filter(
        (v) =>
          v.id === 'label' ||
          v.id === 'label-title-only' ||
          v.id === 'form-field-multiple-labels'
      );

      expect(formViolations).toHaveLength(0);
    });
  });

  test.describe('Direct axe-core usage example', () => {
    test('should not have accessibility violations (direct usage)', async ({
      page,
    }) => {
      await page.goto('/');

      // Direct usage of AxeBuilder without helper
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should check specific WCAG levels directly', async ({ page }) => {
      await page.goto('/');

      // Test specific WCAG levels
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(results.violations).toHaveLength(0);
    });

    test('should exclude specific elements from testing', async ({ page }) => {
      await page.goto('/');

      // Example: Exclude third-party widgets or known issues
      const results = await new AxeBuilder({ page })
        // .exclude('.third-party-widget')
        .analyze();

      expect(results.violations).toHaveLength(0);
    });

    test('should disable specific rules when needed', async ({ page }) => {
      await page.goto('/');

      // Example: Temporarily disable color-contrast for development
      const results = await new AxeBuilder({ page })
        // .disableRules(['color-contrast'])
        .analyze();

      expect(results.violations).toHaveLength(0);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await expectNoA11yViolations(page);
    });

    test('should have proper touch target sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const results = await checkA11y(page, {
        includeTags: ['wcag2aa'],
      });

      // Check for touch target size violations (WCAG 2.5.5)
      const touchTargetViolations = results.violations.filter(
        (v) => v.id === 'target-size'
      );

      expect(touchTargetViolations).toHaveLength(0);
    });
  });
});
