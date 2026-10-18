import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockPortfolioApis } from './support/mocks';

test.beforeEach(async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? 'http://localhost:4173').origin;
  await page.route('**/*', (route) =>
    new URL(route.request().url()).origin === origin
      ? route.continue()
      : route.abort()
  );
  await mockPortfolioApis(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

for (const width of [390, 1280]) {
  test(`project evidence is browsable and downloadable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    const requested: string[] = [];
    page.on('request', (request) =>
      requested.push(new URL(request.url()).pathname)
    );
    await page.goto('/?theme=minimal&mode=dark&visual-test=1#projects');
    const gallery = page.getByRole('group', {
      name: 'Design system examples',
      exact: true,
    });
    await expect(gallery.getByRole('img')).toBeVisible();
    expect(
      requested.some((url) => /design-system-(forms|data|assistant)/.test(url))
    ).toBe(false);
    const dashboard = gallery.getByRole('tab', {
      name: 'Dashboard',
      exact: true,
    });
    await dashboard.focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      gallery.getByRole('tab', { name: 'Forms', exact: true })
    ).toBeFocused();
    await expect(
      gallery.getByRole('tabpanel', { name: 'Forms', exact: true })
    ).toBeVisible();
    await expect(gallery.getByRole('img')).toHaveAttribute(
      'src',
      /design-system-forms/
    );
    await page.keyboard.press('End');
    await expect(
      gallery.getByRole('tab', { name: 'Assistant', exact: true })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(gallery.getByText(/fixed sample response/)).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(
      gallery.getByRole('tab', { name: 'Data', exact: true })
    ).toBeFocused();
    await expect
      .poll(() =>
        gallery
          .getByRole('img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0
          )
      )
      .toBe(true);
    const fullSize = gallery.getByRole('link', {
      name: /View full-size capture/,
    });
    const response = await page.request.get(
      (await fullSize.getAttribute('href'))!
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/image\/webp/);

    const exports = page.getByRole('group', {
      name: 'Wild Apricot export examples',
      exact: true,
    });
    await exports.getByRole('tab', { name: 'CSV', exact: true }).click();
    await expect(exports.getByRole('table').getByRole('row')).toHaveCount(4);
    await expect(
      exports.getByRole('cell', { name: 'PendingRenewal', exact: true })
    ).toBeVisible();
    await expect(exports.getByText(/6 of 24 columns/)).toBeVisible();
    await exports.getByRole('tab', { name: 'JSON', exact: true }).click();
    await expect(
      exports.getByRole('tabpanel', { name: 'JSON', exact: true })
    ).toContainText('FieldValues');
    const jsonOutput = exports.getByRole('region', {
      name: 'JSON export preview',
    });
    await jsonOutput.focus();
    await page.keyboard.press('PageDown');
    await expect
      .poll(() => jsonOutput.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await exports.getByRole('tab', { name: 'JSON', exact: true }).focus();
    await page.keyboard.press('End');
    await expect(
      exports.getByRole('tab', { name: 'Files', exact: true })
    ).toBeFocused();
    await expect(
      exports.getByText('files/Documents/member-guide.txt', { exact: true })
    ).toBeVisible();
    await page.keyboard.press('Home');
    await expect(
      exports.getByRole('tabpanel', { name: 'CLI run', exact: true })
    ).toContainText('Skipped (cached)  : 2');
    expect(requested.some((url) => url.endsWith('.zip'))).toBe(false);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: /Download sample export/ }).click();
    const download = await downloadPromise;
    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toBe('wild-apricot-sample.zip');
    const zip = await page.request.get('/demos/wild-apricot-sample.zip');
    expect((await zip.body()).subarray(0, 2).toString()).toBe('PK');
    expect((await zip.body()).length).toBeGreaterThan(1000);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      )
    ).toBeLessThanOrEqual(1);
    expect(
      (await new AxeBuilder({ page }).include('#projects').analyze()).violations
    ).toEqual([]);
  });
}

test('light mobile evidence keeps all panels within the page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/?theme=cosmic&mode=light&visual-test=1#projects');
  for (const name of [
    'Design system examples',
    'Wild Apricot export examples',
  ]) {
    const group = page.getByRole('group', { name, exact: true });
    await expect(group.getByRole('tab')).toHaveCount(4);
    for (const tab of await group.getByRole('tab').all()) {
      await tab.click();
      await expect(group.getByRole('tabpanel')).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
        )
      ).toBeLessThanOrEqual(1);
    }
  }
  expect(
    (await new AxeBuilder({ page }).include('#projects').analyze()).violations
  ).toEqual([]);
});
