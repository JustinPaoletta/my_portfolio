import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Configuration options for accessibility testing
 */
export interface A11yTestOptions {
  /**
   * Rules to disable during this test
   */
  disableRules?: string[];
  /**
   * Specific tags to run (e.g., ['wcag2a', 'wcag2aa', 'wcag21aa'])
   */
  includeTags?: string[];
  /**
   * Tags to exclude from testing
   */
  excludeTags?: string[];
  /**
   * CSS selectors to exclude from accessibility testing
   */
  excludeSelectors?: string[];
}

/**
 * Run accessibility tests on the current page using axe-core
 *
 * @param page - Playwright Page object
 * @param options - Optional configuration for the accessibility test
 * @returns Accessibility scan results
 *
 * @example
 * ```typescript
 * await checkA11y(page);
 * ```
 *
 * @example
 * ```typescript
 * await checkA11y(page, {
 *   disableRules: ['color-contrast'],
 *   includeTags: ['wcag2aa']
 * });
 * ```
 */
export async function checkA11y(page: Page, options?: A11yTestOptions) {
  let axeBuilder = new AxeBuilder({ page });

  // Apply rule configurations
  if (options?.disableRules && options.disableRules.length > 0) {
    axeBuilder = axeBuilder.disableRules(options.disableRules);
  }

  // Apply tag filters
  if (options?.includeTags && options.includeTags.length > 0) {
    axeBuilder = axeBuilder.withTags(options.includeTags);
  }

  if (options?.excludeTags && options.excludeTags.length > 0) {
    // Exclude specific tags by using withTags with inverse logic
    // Note: axe-core doesn't have a direct excludeTags method
    console.warn('excludeTags is not directly supported by axe-core');
  }

  // Exclude specific selectors
  if (options?.excludeSelectors && options.excludeSelectors.length > 0) {
    options.excludeSelectors.forEach((selector) => {
      axeBuilder = axeBuilder.exclude(selector);
    });
  }

  // Run the accessibility scan
  const results = await axeBuilder.analyze();

  return results;
}

/**
 * Check accessibility and throw an error if violations are found
 *
 * @param page - Playwright Page object
 * @param options - Optional configuration for the accessibility test
 *
 * @example
 * ```typescript
 * test('should have no accessibility violations', async ({ page }) => {
 *   await page.goto('/');
 *   await expectNoA11yViolations(page);
 * });
 * ```
 */
export async function expectNoA11yViolations(
  page: Page,
  options?: A11yTestOptions
) {
  const results = await checkA11y(page, options);

  if (results.violations.length > 0) {
    const violationMessages = results.violations.map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - ${node.html}`)
        .join('\n');
      return `  ${violation.id} (${violation.impact}): ${violation.description}\n${nodes}`;
    });

    throw new Error(
      `Accessibility violations found:\n\n${violationMessages.join('\n\n')}`
    );
  }
}

/**
 * Check accessibility and return a formatted report
 *
 * @param page - Playwright Page object
 * @param options - Optional configuration for the accessibility test
 * @returns Object containing violations, passes, and incomplete results
 */
export async function getA11yReport(page: Page, options?: A11yTestOptions) {
  const results = await checkA11y(page, options);

  return {
    violations: results.violations.length,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    violationDetails: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
      helpUrl: v.helpUrl,
    })),
  };
}

/**
 * Common WCAG compliance levels
 */
export const WCAGLevels = {
  A: ['wcag2a', 'wcag21a'],
  AA: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  AAA: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'],
} as const;

/**
 * Best practice tags for accessibility testing
 */
export const BestPracticeTags = ['best-practice'];

/**
 * Run accessibility tests for WCAG 2.1 Level AA compliance
 * This is the most commonly required compliance level
 *
 * @param page - Playwright Page object
 * @param options - Optional configuration for the accessibility test
 */
export async function checkWCAG21AA(page: Page, options?: A11yTestOptions) {
  return checkA11y(page, {
    ...options,
    includeTags: WCAGLevels.AA,
  });
}
