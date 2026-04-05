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
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'instant',
          })
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

async function expectAllSectionsVisibleAfterFullScroll(
  page: Page
): Promise<void> {
  const expectedSectionIds = [
    'hero',
    'about',
    'projects',
    'articles',
    'experience',
    'skills',
    'github',
    'contact',
    'pet-dogs',
  ] as const;
  const seenSectionIds = new Set<string>();

  const captureVisibleSections = async (): Promise<void> => {
    const visibleSectionIds = await page.evaluate(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>('section[id]')
      );
      return sections
        .filter((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        })
        .map((section) => section.id);
    });

    for (const sectionId of visibleSectionIds) {
      seenSectionIds.add(sectionId);
    }
  };

  // Disable CSS smooth scrolling so programmatic scrollBy jumps instantly.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await expectSectionInViewport(page, 'hero');
  await captureVisibleSections();

  let consecutiveBottomHits = 0;

  for (let step = 0; step < 200; step += 1) {
    const reachedBottom = await page.evaluate(() => {
      const delta = Math.max(80, Math.floor(window.innerHeight * 0.28));
      window.scrollBy(0, delta);

      const scrollElement =
        document.scrollingElement ?? document.documentElement;
      const maxScrollTop = scrollElement.scrollHeight - window.innerHeight;
      return scrollElement.scrollTop >= maxScrollTop - 2;
    });

    await page.waitForTimeout(60);
    await captureVisibleSections();

    if (reachedBottom) {
      consecutiveBottomHits += 1;
      // Stay at the bottom for several ticks so deferred sections that just
      // mounted have time to resolve their lazy imports and render.
      if (consecutiveBottomHits >= 6) {
        break;
      }
    } else {
      consecutiveBottomHits = 0;
    }
  }

  for (const sectionId of expectedSectionIds) {
    await expect(page.locator(`section#${sectionId}`)).toHaveCount(1);
    expect(
      seenSectionIds.has(sectionId),
      `Expected section "${sectionId}" to appear during full-page scroll`
    ).toBe(true);
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

test('short desktop viewport still reveals every deferred section while scrolling', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 1280, height: 420 });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();

  await expectAllSectionsVisibleAfterFullScroll(page);
});

test('short desktop deep link to contact still mounts deferred sections and lands on target', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 1280, height: 420 });
  await page.goto('/#contact');

  await expectSectionInViewport(page, 'contact');
  await expect(page.locator('section#contact')).toBeFocused();
  await expect
    .poll(async () => page.evaluate(() => window.location.hash))
    .toBe('#contact');
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
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused();

  await page.getByRole('link', { name: 'Contact' }).click();

  await expectSectionInViewport(page, 'contact');
  await expect(page.locator('section#contact')).toBeFocused();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );
});

/**
 * Instruments window.scrollTo to record document.body.style.overflow whenever the
 * nav calls scroll programmatically. The menu closes and scroll-lock cleanup runs
 * before deferred navigation (`setTimeout` + double `requestAnimationFrame`),
 * so the first scrollTo
 * should not run while body overflow is still hidden.
 */
test('mobile menu About tap: first scrollTo runs after body scroll lock is released', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const globalWindow = window as Window & {
      __scrollToBodyOverflowLog?: string[];
    };
    globalWindow.__scrollToBodyOverflowLog = [];
    const originalScrollTo = window.scrollTo.bind(window);
    window.scrollTo = function scrollToWithOverflowLog(
      ...args: Parameters<typeof window.scrollTo>
    ): void {
      globalWindow.__scrollToBodyOverflowLog!.push(
        document.body.style.overflow || ''
      );
      originalScrollTo(...args);
    };
  });

  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: /open menu/i }).click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'false'
  );
  await expect
    .poll(async () =>
      page.evaluate(() => document.body.style.overflow === 'hidden')
    )
    .toBe(true);

  await page.getByRole('link', { name: 'About' }).click();

  await expectSectionInViewport(page, 'about');

  const overflowSnapshots = await page.evaluate(() => {
    const globalWindow = window as Window & {
      __scrollToBodyOverflowLog?: string[];
    };
    return globalWindow.__scrollToBodyOverflowLog ?? [];
  });

  expect(
    overflowSnapshots.length,
    'expected navigation to call window.scrollTo at least once'
  ).toBeGreaterThan(0);
  expect(
    overflowSnapshots[0],
    'first programmatic scroll should run only after overflow:hidden is cleared'
  ).toBe('');
});

/** Delay applied to the Contact lazy chunk response (simulates slow network). */
const CONTACT_CHUNK_DELAY_MS = 4500;

/**
 * Delivers the Contact code-split chunk late: Suspense should show
 * SectionRouteFallback (reserved space + status) until the lazy module resolves
 * and `#contact` mounts.
 */
test('slow Contact chunk: shows section fallback until Contact lazy chunk loads', async ({
  page,
}) => {
  await page.route(
    (url) =>
      url.pathname.includes('/assets/') &&
      /\/Contact-[^/]+\.js$/u.test(url.pathname),
    async (route) => {
      await new Promise((resolve) => {
        setTimeout(resolve, CONTACT_CHUNK_DELAY_MS);
      });
      await route.continue();
    }
  );

  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();

  expect(
    await page.evaluate(() => document.getElementById('contact') !== null),
    'Contact is deferred + lazy; it should not exist before navigation forces reveal'
  ).toBe(false);

  await page.getByRole('button', { name: /open menu/i }).click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'false'
  );

  await page.getByRole('link', { name: 'Contact' }).click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );

  await expect
    .poll(
      async () =>
        page.evaluate(
          () =>
            document.querySelector(
              '[data-section-route-fallback][data-section-id="contact"]'
            ) !== null
        ),
      { timeout: 5000 }
    )
    .toBe(true);

  const absentChecks = 18;
  const absentStepMs = 180;
  for (let i = 0; i < absentChecks; i += 1) {
    const { contactMounted, fallbackVisible } = await page.evaluate(() => ({
      contactMounted: document.getElementById('contact') !== null,
      fallbackVisible: Boolean(
        document.querySelector(
          '[data-section-route-fallback][data-section-id="contact"]'
        )
      ),
    }));
    expect(
      contactMounted,
      `expected #contact to stay unmounted while chunk is delayed (sample ${i + 1}/${absentChecks})`
    ).toBe(false);
    expect(
      fallbackVisible,
      `expected Contact Suspense fallback to be visible while chunk is delayed (sample ${i + 1}/${absentChecks})`
    ).toBe(true);
    await page.waitForTimeout(absentStepMs);
  }

  await expect
    .poll(
      async () =>
        page.evaluate(() => document.getElementById('contact') !== null),
      { timeout: 15_000 }
    )
    .toBe(true);

  await expect(
    page.getByRole('heading', { name: /Get In Touch/i })
  ).toBeVisible({ timeout: 10_000 });
});

test('mobile orientation change still reveals deferred sections while scrolling @mobile', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  const mobileSignals = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    portrait: window.innerHeight > window.innerWidth,
  }));
  expect(mobileSignals.userAgent).toMatch(/(iPhone|Android|Mobile)/i);
  expect(mobileSignals.maxTouchPoints).toBeGreaterThan(0);
  expect(mobileSignals.coarsePointer).toBe(true);
  expect(mobileSignals.portrait).toBe(true);

  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();

  const portraitViewport = page.viewportSize();
  expect(portraitViewport).not.toBeNull();

  const portraitWidth = portraitViewport?.width ?? 390;
  const portraitHeight = portraitViewport?.height ?? 844;

  // Rotate to landscape immediately and verify deferred sections still render.
  await page.setViewportSize({ width: portraitHeight, height: portraitWidth });
  const landscape = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  expect(landscape.width).toBeGreaterThan(landscape.height);
  await expectAllSectionsVisibleAfterFullScroll(page);

  // Rotate back to portrait and verify all sections remain visible.
  await page.setViewportSize({ width: portraitWidth, height: portraitHeight });
  const portraitAgain = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  expect(portraitAgain.height).toBeGreaterThan(portraitAgain.width);
  await expectAllSectionsVisibleAfterFullScroll(page);
});

test('mobile orientation + full scroll works on preview base URL @mobile @preview', async ({
  page,
  baseURL,
}) => {
  test.skip(
    !baseURL || /https?:\/\/(localhost|127\.0\.0\.1)/i.test(baseURL),
    'Set PLAYWRIGHT_BASE_URL to a Vercel preview URL to run this test.'
  );

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const mobileSignals = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    portrait: window.innerHeight > window.innerWidth,
  }));
  expect(mobileSignals.userAgent).toMatch(/(iPhone|Android|Mobile)/i);
  expect(mobileSignals.maxTouchPoints).toBeGreaterThan(0);
  expect(mobileSignals.coarsePointer).toBe(true);
  expect(mobileSignals.portrait).toBe(true);

  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible({ timeout: 20_000 });

  const portraitViewport = page.viewportSize();
  expect(portraitViewport).not.toBeNull();

  const portraitWidth = portraitViewport?.width ?? 390;
  const portraitHeight = portraitViewport?.height ?? 844;

  // Portrait -> landscape immediately, then complete a full-page scroll pass.
  await page.setViewportSize({ width: portraitHeight, height: portraitWidth });
  await expectAllSectionsVisibleAfterFullScroll(page);
});
