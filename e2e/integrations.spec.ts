import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

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

test('GitHub section renders live stats from API responses', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  const githubSection = await revealDeferredSection(page, 'github');

  await expect(
    githubSection.getByRole('heading', { name: /GitHub Activity/i })
  ).toBeVisible();
  await expect(githubSection.getByText('@JustinPaoletta')).toBeVisible();
  await expect(
    githubSection.getByRole('heading', { name: /contributions in the last/i })
  ).toBeVisible();
  await expect(
    githubSection.getByRole('link', { name: /View Full Profile on GitHub/i })
  ).toHaveAttribute('href', 'https://github.com/JustinPaoletta');
});

test('GitHub section shows resilient error state when API calls fail', async ({
  page,
}) => {
  await mockPortfolioApis(page, {
    githubRestError: true,
    githubProxyError: true,
  });
  await page.goto('/');

  const githubSection = await revealDeferredSection(page, 'github');

  await expect(
    githubSection.getByRole('alert').getByText(/Unable to load GitHub data/i)
  ).toBeVisible();
});

test('deferred GitHub and pet dogs requests wait until their sections mount', async ({
  page,
}) => {
  let githubProxyRequests = 0;
  let petDogsGetRequests = 0;

  page.on('request', (request) => {
    const url = request.url();

    if (url.includes('/api/github?')) {
      githubProxyRequests += 1;
    }

    if (url.includes('/api/pet-dogs') && request.method() === 'GET') {
      petDogsGetRequests += 1;
    }
  });

  await mockPortfolioApis(page);
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(githubProxyRequests).toBe(0);
  const initialPetDogsGetRequests = petDogsGetRequests;

  await page
    .getByRole('navigation', { name: /main navigation/i })
    .getByRole('link', { name: 'GitHub', exact: true })
    .click();
  await expect(page.locator('section#github')).toBeVisible({ timeout: 10_000 });
  await expect.poll(() => githubProxyRequests).toBeGreaterThan(0);
  await expect(page.locator('section#pet-dogs')).toHaveCount(0);
  expect(petDogsGetRequests).toBe(initialPetDogsGetRequests);

  await revealDeferredSection(page, 'pet-dogs');
  await expect
    .poll(() => petDogsGetRequests)
    .toBeGreaterThan(initialPetDogsGetRequests);
});

test('contact form submits successfully and clears form state', async ({
  page,
}) => {
  let submittedPayload: {
    name: string;
    email: string;
    message: string;
  } | null = null;

  await mockPortfolioApis(page, {
    onContactRequest: (payload) => {
      submittedPayload = payload;
    },
  });
  await page.goto('/');

  const contactSection = await revealDeferredSection(page, 'contact');

  await page.getByLabel('Your Name').fill('Jane Doe');
  await page.getByLabel('Email Address').fill('jane@example.com');
  await page
    .getByLabel('Message')
    .fill('Hello Justin, I would love to chat about a frontend role.');

  await page.getByRole('button', { name: /send message/i }).click();

  await expect(
    contactSection.getByRole('status').getByText(/Message sent successfully/i)
  ).toBeVisible();
  await expect(page.getByLabel('Your Name')).toHaveValue('');
  await expect(page.getByLabel('Email Address')).toHaveValue('');
  await expect(page.getByLabel('Message')).toHaveValue('');
  expect(submittedPayload).toEqual({
    name: 'Jane Doe',
    email: 'jane@example.com',
    message: 'Hello Justin, I would love to chat about a frontend role.',
  });
});

test('contact form shows error feedback when API submission fails', async ({
  page,
}) => {
  await mockPortfolioApis(page, { contactError: true });
  await page.goto('/');

  const contactSection = await revealDeferredSection(page, 'contact');

  await page.getByLabel('Your Name').fill('John Smith');
  await page.getByLabel('Email Address').fill('john@example.com');
  await page
    .getByLabel('Message')
    .fill('Checking the error path for contact form reliability.');

  await page.getByRole('button', { name: /send message/i }).click();

  await expect(
    contactSection.getByRole('alert').getByText(/Failed to send message/i)
  ).toBeVisible();
  await expect(page.getByLabel('Your Name')).toHaveValue('John Smith');
  await expect(page.getByLabel('Email Address')).toHaveValue(
    'john@example.com'
  );
});

test('pet dogs section syncs API data and tracks interactions', async ({
  page,
}) => {
  const petDogPosts: Array<{ dogName: string; action: string }> = [];

  await mockPortfolioApis(page, {
    petDogsStats: {
      Nala: { treats: 2, scritches: 1 },
      Rosie: { treats: 4, scritches: 3 },
      Tito: { treats: 1, scritches: 5 },
    },
    onPetDogsPost: (payload) => {
      petDogPosts.push(payload);
    },
  });
  await page.goto('/');

  await revealDeferredSection(page, 'pet-dogs');
  await page.getByRole('button', { name: /show dogs/i }).click();

  const treatButton = page.getByRole('button', {
    name: /Give Nala a treat\. Current treats: 2/i,
  });
  await expect(treatButton).toBeVisible();
  await treatButton.click();

  await expect(
    page.getByRole('button', {
      name: /Give Nala a treat\. Current treats: 3/i,
    })
  ).toBeVisible();

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const stored = localStorage.getItem('pet-dogs-stats');
        if (!stored) return 0;
        return (JSON.parse(stored) as { Nala?: { treats?: number } }).Nala
          ?.treats;
      })
    )
    .toBe(3);

  await expect.poll(() => petDogPosts.length).toBeGreaterThan(0);
  expect(petDogPosts).toContainEqual({ dogName: 'Nala', action: 'treat' });
});
