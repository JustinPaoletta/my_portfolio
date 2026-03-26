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

  await page.getByRole('menuitem', { name: 'Contact' }).click();

  await expectSectionInViewport(page, 'contact');
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

  await page.getByRole('menuitem', { name: 'Contact' }).click();

  await expectSectionInViewport(page, 'contact');
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );
});
