import { expect, test, type Locator, type Response } from '@playwright/test';
import sharp from 'sharp';
import { mockPortfolioApis } from './support/mocks';
import { revealDeferredSection } from './support/sections';

interface ProjectImageTarget {
  name: string;
  basename: string;
  kind: 'featured' | 'icon';
  candidateWidths: readonly number[];
}

interface ImageMeasurement {
  project: string;
  currentSrc: string;
  browserDecodeSucceeded: boolean;
  devicePixelRatio: number;
  rendered: {
    width: number;
    height: number;
    paintedSquareSide: number;
    objectFit: string;
  };
  resource: {
    status: number;
    contentType: string;
    format: string;
    width: number;
    height: number;
    hasAlpha: boolean;
    fromServiceWorker: boolean;
    responseBodyBytes: number;
    imageFileBytes: number;
  };
  resolution: {
    requiredPixelWidth: number;
    nearestCandidateWidth: number;
    largestAllowedCandidateWidth: number;
  };
}

const TARGETS: readonly ProjectImageTarget[] = [
  {
    name: 'SideQuest: Pittsburgh',
    basename: 'sidequest-logo',
    kind: 'featured',
    candidateWidths: [240, 480, 720, 960, 1254],
  },
  {
    name: 'wild-apricot-exports',
    basename: 'wae-exports-logo',
    kind: 'icon',
    candidateWidths: [60, 120, 180],
  },
  {
    name: 'Plexarr',
    basename: 'plexarr-icon',
    kind: 'icon',
    candidateWidths: [60, 120, 180],
  },
];

const VIEWPORT_CASES = [
  { width: 320, height: 844, deviceScaleFactor: 2 },
  { width: 390, height: 844, deviceScaleFactor: 2 },
  { width: 1024, height: 1000, deviceScaleFactor: 2 },
  { width: 1440, height: 1000, deviceScaleFactor: 2 },
  { width: 1440, height: 1000, deviceScaleFactor: 1 },
] as const;

function isProjectImagePath(pathname: string): boolean {
  return (
    pathname.startsWith('/images/projects/') ||
    pathname.includes('/assets/source/project-logos/')
  );
}

async function decodeLoadedImage(image: Locator): Promise<void> {
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const imageElement = element as HTMLImageElement;
        return imageElement.complete && imageElement.naturalWidth > 0;
      })
    )
    .toBe(true);
  await image.evaluate((element) => (element as HTMLImageElement).decode());
}

async function measureImage(
  image: Locator,
  target: ProjectImageTarget,
  responses: Map<string, Response>
): Promise<ImageMeasurement> {
  await decodeLoadedImage(image);

  const rendered = await image.evaluate((element) => {
    const imageElement = element as HTMLImageElement;
    const box = imageElement.getBoundingClientRect();
    return {
      currentSrc: imageElement.currentSrc,
      devicePixelRatio: window.devicePixelRatio,
      width: box.width,
      height: box.height,
      // These logo resources are square and use object-fit: contain.
      paintedSquareSide: Math.min(box.width, box.height),
      objectFit: getComputedStyle(imageElement).objectFit,
    };
  });

  // Collect responses before navigation: a lazy image may finish loading
  // before it is selected for measurement.
  const response = responses.get(rendered.currentSrc);
  if (!response) {
    throw new Error(`No image response captured for ${rendered.currentSrc}`);
  }

  const body = await response.body();
  const metadata = await sharp(body).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Image has no decoded dimensions: ${rendered.currentSrc}`);
  }
  const requestSizes = await response.request().sizes();
  const largestCandidate = target.candidateWidths.at(-1)!;
  const requiredPixelWidth = Math.min(
    rendered.paintedSquareSide * rendered.devicePixelRatio,
    largestCandidate
  );
  const nearestIndex = target.candidateWidths.findIndex(
    (width) => width + 1 >= requiredPixelWidth
  );
  const nearestCandidateWidth = target.candidateWidths[nearestIndex];
  // Browsers may choose a slightly larger candidate. Allow one size tier
  // beyond the nearest adequate asset, but reject disproportionate downloads.
  const largestAllowedCandidateWidth =
    target.candidateWidths[
      Math.min(nearestIndex + 1, target.candidateWidths.length - 1)
    ];

  return {
    project: target.name,
    currentSrc: rendered.currentSrc,
    browserDecodeSucceeded: true,
    devicePixelRatio: rendered.devicePixelRatio,
    rendered: {
      width: rendered.width,
      height: rendered.height,
      paintedSquareSide: rendered.paintedSquareSide,
      objectFit: rendered.objectFit,
    },
    resource: {
      status: response.status(),
      contentType: response.headers()['content-type'] ?? '',
      format: metadata.format ?? 'unknown',
      width: metadata.width,
      height: metadata.height,
      hasAlpha: metadata.hasAlpha,
      fromServiceWorker: response.fromServiceWorker(),
      responseBodyBytes: requestSizes.responseBodySize,
      imageFileBytes: body.byteLength,
    },
    resolution: {
      requiredPixelWidth,
      nearestCandidateWidth,
      largestAllowedCandidateWidth,
    },
  };
}

for (const viewportCase of VIEWPORT_CASES) {
  const { width, height, deviceScaleFactor } = viewportCase;

  test.describe(`project images at ${width}px and DPR ${deviceScaleFactor}`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor });

    test('loads appropriately sized modern logos from real asset responses', async ({
      page,
    }, testInfo) => {
      const requestedPaths = new Set<string>();
      const responses = new Map<string, Response>();
      const failedRequests: string[] = [];
      const measurements: ImageMeasurement[] = [];

      page.on('request', (request) => {
        const pathname = new URL(request.url()).pathname;
        if (isProjectImagePath(pathname)) requestedPaths.add(pathname);
      });
      page.on('response', (response) => {
        if (isProjectImagePath(new URL(response.url()).pathname)) {
          responses.set(response.url(), response);
        }
      });
      page.on('requestfailed', (request) => {
        if (isProjectImagePath(new URL(request.url()).pathname)) {
          failedRequests.push(
            `${request.url()}: ${request.failure()?.errorText ?? 'unknown error'}`
          );
        }
      });

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockPortfolioApis(page);
      await page.goto('/?theme=minimal&mode=light');
      await page.mouse.move(0, 0);

      try {
        const projects = await revealDeferredSection(page, 'projects');

        for (const target of TARGETS) {
          const card = projects.locator('article').filter({
            has: page.getByRole('heading', { name: target.name, exact: true }),
          });
          const image =
            target.kind === 'featured'
              ? card.getByRole('img', { name: `${target.name} logo` })
              : card.locator('img.folder-icon--image');
          const measurement = await measureImage(image, target, responses);
          measurements.push(measurement);

          expect(measurement.devicePixelRatio).toBe(deviceScaleFactor);
          expect(new URL(measurement.currentSrc).pathname).toMatch(
            new RegExp(`^/images/projects/${target.basename}-\\d+\\.webp$`)
          );
          expect(measurement.resource.status).toBe(200);
          expect(measurement.resource.contentType).toMatch(/^image\/webp\b/);
          expect(measurement.resource.format).toBe('webp');
          expect(measurement.resource.fromServiceWorker).toBe(false);
          expect(measurement.resource.responseBodyBytes).toBeGreaterThan(0);
          expect(measurement.resource.imageFileBytes).toBeGreaterThan(0);
          expect(measurement.rendered.objectFit).toBe('contain');
          expect(measurement.rendered.paintedSquareSide).toBeGreaterThan(0);
          expect(measurement.resource.width).toBe(measurement.resource.height);
          expect(target.candidateWidths).toContain(measurement.resource.width);
          expect(measurement.resource.width + 1).toBeGreaterThanOrEqual(
            measurement.resolution.requiredPixelWidth
          );
          expect(measurement.resource.width).toBeLessThanOrEqual(
            measurement.resolution.largestAllowedCandidateWidth
          );

          if (target.kind === 'icon') {
            expect(measurement.rendered.width).toBeCloseTo(60, 0);
            expect(measurement.rendered.height).toBeCloseTo(60, 0);
          }
        }

        expect(failedRequests).toEqual([]);
        const originalRequests = [...requestedPaths].filter(
          (pathname) =>
            pathname.includes('/assets/source/project-logos/') ||
            /\/(?:sidequest-logo|wae-exports-logo|plexarr[-_]icon)\.png$/.test(
              pathname
            )
        );
        expect(originalRequests).toEqual([]);

        if (width === 1440 && deviceScaleFactor === 1) {
          // Load the remaining artwork before the one evidence screenshot;
          // this is an attachment, not a visual snapshot baseline.
          for (const image of await projects.locator('img').all()) {
            await decodeLoadedImage(image);
          }
          await testInfo.attach('projects-desktop-image-evidence', {
            body: await projects.screenshot({
              type: 'jpeg',
              quality: 70,
              animations: 'disabled',
            }),
            contentType: 'image/jpeg',
          });
        }
      } finally {
        await testInfo.attach('project-image-measurements', {
          body: Buffer.from(
            JSON.stringify(
              {
                viewport: { width, height },
                configuredDeviceScaleFactor: deviceScaleFactor,
                measurements,
                requestedProjectImagePaths: [...requestedPaths].sort(),
                failedRequests,
              },
              null,
              2
            )
          ),
          contentType: 'application/json',
        });
      }
    });
  });
}
