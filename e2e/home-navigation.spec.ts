import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function expectSectionInViewport(
  page: Page,
  sectionId: string
): Promise<void> {
  await expect
    .poll(
      async () =>
        page
          .locator(`section#${sectionId}`)
          .evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          })
          .catch(() => false),
      { timeout: 10_000 }
    )
    .toBe(true);
}

async function revealDeferredSection(
  page: Page,
  sectionId: string
): Promise<ReturnType<Page['locator']>> {
  await expect
    .poll(
      async () => {
        await page.evaluate(() =>
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' })
        );

        return page.evaluate(
          (targetId) => Boolean(document.getElementById(targetId)),
          sectionId
        );
      },
      {
        timeout: 15_000,
        intervals: [250, 500, 1_000],
      }
    )
    .toBe(true);

  const section = page.locator(`section#${sectionId}`);
  await expect(section).toBeVisible({ timeout: 10_000 });
  return section;
}

async function expectSectionVisibleAfterScroll(
  page: Page,
  sectionId: string
): Promise<void> {
  const section = page.locator(`section#${sectionId}`);
  await expect(section).toBeVisible({ timeout: 10_000 });
  await section.scrollIntoViewIfNeeded();
  await expect
    .poll(
      async () =>
        section
          .evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          })
          .catch(() => false),
      { timeout: 10_000 }
    )
    .toBe(true);
}

async function expectSectionVisibleViaNaturalScroll(
  page: Page,
  sectionId: string
): Promise<void> {
  await expect
    .poll(
      async () => {
        await page.evaluate(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'auto',
          });
        });

        return page.evaluate((targetId) => {
          const section = document.getElementById(targetId);
          return section instanceof HTMLElement;
        }, sectionId);
      },
      {
        timeout: 20_000,
        intervals: [150, 250, 500, 1_000],
      }
    )
    .toBe(true);

  await expectSectionVisibleAfterScroll(page, sectionId);
}

async function expectAllSectionsVisible(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await expectSectionInViewport(page, 'hero');

  for (const sectionId of [
    'about',
    'projects',
    'articles',
    'experience',
    'skills',
    'github',
    'contact',
    'pet-dogs',
  ] as const) {
    await expectSectionVisibleViaNaturalScroll(page, sectionId);
  }
}

test('renders core portfolio sections in default theme', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await expect(page).toHaveTitle(/.+/);
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /My Career/i })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /My Projects/i })
  ).toBeVisible();

  const experienceSection = await revealDeferredSection(page, 'experience');
  const articlesSection = await revealDeferredSection(page, 'articles');
  const githubSection = await revealDeferredSection(page, 'github');
  const contactSection = await revealDeferredSection(page, 'contact');

  await expect(
    experienceSection.getByRole('heading', { name: /Experience & Education/i })
  ).toBeVisible();
  await expect(
    articlesSection.getByRole('heading', { name: /LinkedIn Articles/i })
  ).toBeVisible();
  await expect(
    githubSection.getByRole('heading', { name: /GitHub Activity/i })
  ).toBeVisible();
  await expect(
    contactSection.getByRole('heading', { name: /Get In Touch/i })
  ).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('desktop navigation scrolls to Contact section', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await page.getByRole('link', { name: 'Contact' }).click();

  await expectSectionInViewport(page, 'contact');
  await expect(page.locator('section#contact')).toBeFocused();
  await expect
    .poll(async () => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(300);
});

test('mobile navigation opens, navigates, and closes', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /open menu/i });
  await menuButton.click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'false'
  );
  await expect(page.getByRole('dialog', { name: 'Main menu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeFocused();

  await page.getByRole('link', { name: 'Contact' }).click();

  await expectSectionInViewport(page, 'contact');
  await expect(page.locator('section#contact')).toBeFocused();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );
});

test('mobile orientation change still reveals deferred sections while scrolling', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();

  // Rotate to landscape and verify deferred sections still render on scroll.
  await page.setViewportSize({ width: 844, height: 390 });
  await expectAllSectionsVisible(page);

  // Rotate back to portrait and verify all sections remain visible.
  await page.setViewportSize({ width: 390, height: 844 });
  await expectAllSectionsVisible(page);
});
