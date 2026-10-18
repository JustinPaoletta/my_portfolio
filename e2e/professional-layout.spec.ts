import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';
import { revealDeferredSection } from './support/sections';

for (const width of [320, 390, 1280]) {
  test(`professional section controls retain their intended layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockPortfolioApis(page);
    await page.goto('/?theme=minimal&mode=dark&visual-test=1');
    const social = await page.locator('.hero-social').boundingBox();
    const actions = await page.locator('.hero-cta').boundingBox();
    expect(social!.y + social!.height).toBeLessThanOrEqual(actions!.y);
    const role = await page.locator('.hero-role').boundingBox();
    const stack = await page.locator('.hero-stack').boundingBox();
    expect(stack!.y - (role!.y + role!.height)).toBeGreaterThanOrEqual(8);
    const projects = page.locator('#projects');
    await revealDeferredSection(page, 'projects');
    const featured = projects.locator('.featured-project');
    await expect(featured.locator('h3')).toHaveText([
      '@jp-design-system',
      'BitStockerz',
      'wild-apricot-exports',
      'Plexarr',
    ]);
    if (width <= 1024) {
      for (const project of await featured.all()) {
        const info = await project.locator('.project-content').boundingBox();
        const demo = await project
          .locator('.project-showcase, .project-demo, .export-showcase')
          .first()
          .boundingBox();
        expect(demo!.y).toBeGreaterThanOrEqual(info!.y + info!.height - 1);
      }
    }
    const experience = page.locator('#experience');
    await revealDeferredSection(page, 'experience');
    const work = await experience
      .getByRole('heading', { name: 'Work', exact: true })
      .boundingBox();
    const resume = await experience
      .getByRole('link', { name: 'Download resume as PDF' })
      .boundingBox();
    expect(resume!.x).toBeGreaterThan(work!.x + work!.width);
    expect(
      Math.abs(resume!.y + resume!.height / 2 - work!.y - work!.height / 2)
    ).toBeLessThan(2);
    const skills = page.locator('#skills');
    await revealDeferredSection(page, 'skills');
    await expect(
      skills.getByRole('heading', { name: 'AI-Assisted Development' })
    ).toBeVisible();
    await expect(skills.locator('a')).toHaveCount(0);
    for (const card of await skills.getByRole('article').all()) {
      const icons = card.locator('.skill-icon img');
      const caption = card.getByRole('list');
      const image = await icons.first().boundingBox();
      const names = await caption.boundingBox();
      expect(image!.width).toBeGreaterThanOrEqual(32);
      expect(names!.y).toBeGreaterThan(image!.y + image!.height);
    }
    const articles = page.locator('#articles');
    await revealDeferredSection(page, 'articles');
    const previous = await articles
      .getByRole('button', { name: 'Previous article' })
      .boundingBox();
    const counter = await articles
      .getByText('Article 1 of 2', { exact: true })
      .boundingBox();
    const next = await articles
      .getByRole('button', { name: 'Next article' })
      .boundingBox();
    expect(previous!.x + previous!.width).toBeLessThanOrEqual(counter!.x);
    expect(next!.x).toBeGreaterThanOrEqual(counter!.x + counter!.width);
    for (const arrow of [previous!, next!])
      expect(
        Math.abs(arrow.y + arrow.height / 2 - counter!.y - counter!.height / 2)
      ).toBeLessThan(2);
    await expect(
      articles.getByText('See more on', { exact: true })
    ).toBeVisible();
    const label = await articles
      .getByText('See more on', { exact: true })
      .boundingBox();
    const linkedin = await articles
      .getByRole('link', { name: 'See more on LinkedIn', exact: true })
      .boundingBox();
    expect(
      Math.abs(
        label!.y + label!.height / 2 - linkedin!.y - linkedin!.height / 2
      )
    ).toBeLessThan(2);
    const about = page.locator('#about');
    expect(
      (
        await new AxeBuilder({ page })
          .include('#about')
          .include('#skills')
          .analyze()
      ).violations
    ).toEqual([]);
    await expect(about.getByRole('link', { name: /experience/i })).toHaveCount(
      0
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}
