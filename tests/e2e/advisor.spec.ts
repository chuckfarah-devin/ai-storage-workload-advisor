import { test, expect, type Page, type Locator } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SHOTS = join(process.cwd(), 'docs', 'verification', 'm4', 'screenshots');
mkdirSync(SHOTS, { recursive: true });
const shot = (page: Page, name: string, fullPage = false) =>
  page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage });

async function setSlider(slider: Locator, value: number) {
  await slider.evaluate((el: HTMLElement, v: number) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, String(v));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

const banner = (page: Page) => page.getByLabel('Decision summary');
const weeklyPanel = (page: Page) => page.locator('section.panel').filter({ hasText: '1,008 ten-minute buckets' });
const detailPanel = (page: Page) => page.locator('section.panel').filter({ hasText: 'Detail day' });

async function selectScenario(page: Page, infra: string, workload: string) {
  await page.getByLabel('Infrastructure').selectOption(infra);
  await page.getByLabel('Proposed workload').selectOption(workload);
  await expect(banner(page)).toBeVisible();
}

test.describe('M4 browser verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(banner(page)).toContainText('workload');
  });

  test('a. all four combinations render engine statuses', async ({ page }) => {
    await expect(banner(page)).toContainText('Modeled constraint');
    await expect(banner(page)).toContainText('iops.backend');

    await selectScenario(page, 'INF-A', 'WL-VM');
    await expect(banner(page)).toContainText('Needs investigation');

    await selectScenario(page, 'INF-A', 'WL-RAG');
    await expect(banner(page)).toContainText('Needs investigation');
    await expect(page.getByText(/computable minutes only/i)).toBeVisible();
    await expect(page.getByText(/unknown minutes: 900/)).toBeVisible();

    await selectScenario(page, 'INF-B', 'WL-RAG');
    await expect(banner(page)).toContainText('Modeled constraint');
  });

  test('b. what-if controls update cards and deltas', async ({ page }) => {
    await page.getByLabel('Demand multiplier').selectOption('2');
    await expect(page.getByText('87.5%')).toBeVisible();
    const panel = page.locator('section.panel').filter({ hasText: 'Baseline vs what-if' });
    await expect(panel.locator('tbody tr').first()).toBeVisible();
    await shot(page, 'desktop-whatif-2x');

    await page.getByLabel('Demand multiplier').selectOption('1');
    await page.getByLabel('Growth horizon').selectOption('3');
    // h=3: VM growth 214.449 TiB > 212 TiB budget on INF-B → constraint
    await expect(page.locator('.card').filter({ hasText: 'growth headroom' }).first())
      .toContainText('Modeled constraint');
  });

  test('c. weekly chart inspection: metrics, slider, hover, click, keyboard', async ({ page }) => {
    const wp = weeklyPanel(page);
    const slider = wp.getByLabel('Inspect bucket');
    const readout = wp.getByRole('status');

    await setSlider(slider, 60);
    await expect(readout).toContainText('Mon 10:00');
    await expect(readout).toContainText('177,475');
    await expect(readout).toContainText('206,100');

    await setSlider(slider, 1007);
    await expect(readout).toContainText('Sun 23:50');

    // metric toggles
    await wp.getByLabel('Weekly chart metric').selectOption('frontendIops');
    await expect(readout).toContainText('IOPS');
    await wp.getByLabel('Weekly chart metric').selectOption('throughputBytesPerSecond');
    await expect(readout).toContainText('B/s');
    await wp.getByLabel('Weekly chart metric').selectOption('backendOps');

    // hover changes the readout
    const before = await readout.innerText();
    const svg = wp.locator('svg');
    await svg.scrollIntoViewIfNeeded();
    const box = await svg.boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.35, box!.y + box!.height * 0.5);
    await expect(readout).not.toHaveText(before);

    // click sets it
    const hoverText = await readout.innerText();
    await svg.click({ position: { x: box!.width * 0.5, y: box!.height * 0.5 } });
    await expect(readout).not.toHaveText(hoverText);

    // keyboard advances the focused slider
    const clickText = await readout.innerText();
    await slider.focus();
    await slider.press('ArrowRight');
    await expect(readout).not.toHaveText(clickText);
    await setSlider(slider, 60);
    await wp.scrollIntoViewIfNeeded();
    await shot(page, 'desktop-weekly-hidden-burst');
  });

  test('d. detail chart: presets, day selector, units, backend unknown', async ({ page }) => {
    const dp = detailPanel(page);
    const slider = dp.getByLabel('Inspect minute');
    const readout = dp.getByRole('status');
    const pressed = dp.locator('button[aria-pressed="true"]');

    // Full day is the selected preset on load — exactly one pressed
    await expect(pressed).toHaveCount(1);
    await expect(dp.getByRole('button', { name: 'Full day' })).toHaveAttribute('aria-pressed', 'true');

    await dp.getByRole('button', { name: 'Morning burst' }).click();
    await expect(readout).toContainText('10:00 UTC');
    // selection visibly retained: exactly one pressed button, matching the window
    await expect(pressed).toHaveCount(1);
    await expect(dp.getByRole('button', { name: 'Morning burst' })).toHaveAttribute('aria-pressed', 'true');
    await expect(dp.getByRole('button', { name: 'Full day' })).toHaveAttribute('aria-pressed', 'false');
    await setSlider(slider, 5);
    await expect(readout).toContainText('10:05 UTC');
    await expect(readout).toContainText('1.4 ms');
    await shot(page, 'desktop-detail-morning');

    await dp.getByRole('button', { name: 'Afternoon burst' }).click();
    await expect(readout).toContainText('14:00 UTC');

    await dp.getByRole('button', { name: 'Nightly batch' }).click();
    await expect(readout).toContainText('21:55 UTC');
    await expect(dp.getByText(/not modeled/)).toBeVisible();

    // bandwidth view shows a decimal rate unit
    await dp.getByLabel('Y1 metric').selectOption('frontendBandwidth');
    await expect(dp.locator('svg').getByText(/front-end bandwidth \([MG]B\/s\)/)).toBeVisible();
    await expect(readout).toContainText(/[MG]B\/s/);
    await shot(page, 'desktop-detail-bandwidth');
    await dp.getByLabel('Y1 metric').selectOption('frontendIops');
    await expect(dp.locator('svg').getByText('front-end IOPS')).toBeVisible();

    // RAG backend unknown at Monday 02:00 (minute 120, full-day window)
    await selectScenario(page, 'INF-A', 'WL-RAG');
    await dp.getByRole('button', { name: 'Full day' }).click();
    await dp.getByLabel('Y1 metric').selectOption('backendOps');
    await setSlider(slider, 120);
    await expect(readout).toContainText('unknown');
    await expect(readout).toContainText('65536');
    await shot(page, 'desktop-rag-unknown-ingestion');

    // day selector: Saturday disables morning burst, resets selection to Full day
    await dp.getByLabel('Detail day').selectOption('5');
    await expect(dp.getByRole('button', { name: 'Morning burst' })).toBeDisabled();
    await expect(pressed).toHaveCount(1);
    await expect(dp.getByRole('button', { name: 'Full day' })).toHaveAttribute('aria-pressed', 'true');
    await expect(dp.getByText(/No morning burst window is scheduled on Saturday/)).toBeVisible();
    await expect(dp.getByText(/Engine default: Monday/)).toBeVisible();

    // latency axis label exists, distinct from Y1
    await expect(dp.locator('svg').getByText('Latency (ms)')).toBeVisible();
  });

  test('h. workload details expand with phases and the RAG deployment assumption', async ({ page }) => {
    await selectScenario(page, 'INF-A', 'WL-RAG');
    const det = page.locator('details').filter({ hasText: 'Workload details' });
    await det.locator('summary').click();
    await expect(det).toContainText('self-hosted vector/search service');
    await expect(det).toContainText('not a requirement of RAG');
    await expect(det).toContainText('query-time retrieval');
    await expect(det).toContainText('ingestion/index maintenance');
    await expect(det).toContainText('GPU inference');
    // phase table: three-hour ingestion window, derived bandwidth shown
    await expect(det).toContainText('02:00–05:00');
    await expect(det).toContainText('substantial synthetic assumption');
    await expect(det).toContainText('1.31 GB/s');
    await shot(page, 'desktop-workload-details-rag');
  });

  test('e. exports download engine output', async ({ page }) => {
    const [dlJson] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download assessment JSON' }).click(),
    ]);
    const json = JSON.parse((await dlJson.createReadStream().then(async (s) => {
      let t = '';
      for await (const c of s) t += c;
      return t;
    })) as string);
    expect(json.infrastructureId).toBe('INF-B');
    expect(json.workloadId).toBe('WL-VM');
    expect(json.rulesetVersion).toContain('m2');
    expect(json.coverage.trace.fraction).toBe(1);
    expect(json.label).toContain('Synthetic data');
    expect(json.weekly.backendOps.summary.max).toBeCloseTo(206100, 3);
    expect(json.limitations.length).toBeGreaterThanOrEqual(4);

    const [dlTxt] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download text report' }).click(),
    ]);
    const txt = await dlTxt.createReadStream().then(async (s) => {
      let t = '';
      for await (const c of s) t += c;
      return t;
    });
    expect(txt).toContain('Weekly (10,080-minute trace');
  });

  test('f. forbidden phrases absent (R-UI-4)', async ({ page }) => {
    for (const w of ['WL-VM', 'WL-RAG']) {
      for (const i of ['INF-A', 'INF-B']) {
        await selectScenario(page, i, w);
        const text = await page.evaluate(() => document.body.innerText);
        expect(text).not.toMatch(/PowerMax|ONTAP/i);
        expect(text).not.toMatch(/\bvalidated\b|\bvalidated by\b/i);
        expect(text).not.toMatch(/production sizing/i);
        expect(text).not.toMatch(/post-addition latency (is|will be) (predicted|estimated|forecast)/i);
      }
    }
  });

  test('g. screenshots (desktop set)', async ({ page }, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'desktop screenshots run in the desktop project');
    await shot(page, 'desktop-overview');
    const env = page.locator('details').filter({ hasText: 'Environment details' });
    await env.locator('summary').click();
    await env.scrollIntoViewIfNeeded();
    await shot(page, 'desktop-environment-expanded');
  });
});

test.describe('mobile layout', () => {
  test('g-mobile. no horizontal overflow, panels stack, axes readable', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile layout checks run in the mobile project');
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    const scrollW = await page.evaluate(() => document.scrollingElement!.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(376);

    const cols = await page.locator('.columns').evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
    );
    expect(cols).toBe(1);

    const wp = weeklyPanel(page);
    await shot(page, 'mobile-overview');
    await wp.scrollIntoViewIfNeeded();
    await expect(wp.locator('svg')).toBeVisible();
    await shot(page, 'mobile-weekly');
  });

  test('g-mobile-detail. Y1/Y2 axis labels do not overlap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile layout checks run in the mobile project');
    await page.goto('/');
    const dp = detailPanel(page);
    const svg = dp.locator('svg');
    const labels = await svg.locator('text').evaluateAll((els) =>
      els.map((e) => {
        const r = (e as SVGTextElement).getBoundingClientRect();
        return { t: e.textContent ?? '', l: r.left, r: r.right, w: r.width };
      }),
    );
    const y1 = labels.find((l) => /IOPS|GB\/s|MB\/s|ops\/s/.test(l.t) && l.t.length < 40);
    const y2 = labels.find((l) => l.t === 'Latency (ms)');
    expect(y1).toBeTruthy();
    expect(y2).toBeTruthy();
    expect(y1!.r).toBeLessThanOrEqual(y2!.l + 1);

    // no element wider than the viewport (svg internals use viewBox coords;
    // scrollable table contents are intentionally wider than their container)
    const over = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return [...document.querySelectorAll('body *')].filter(
        (el) =>
          !el.closest('svg') &&
          !el.closest('.evidence-table') &&
          !el.closest('.delta-table') &&
          el.getBoundingClientRect().width > w + 1,
      ).length;
    });
    expect(over).toBe(0);

    // SVG text must render at its CSS font size at this width (viewBox matches
    // the measured container width, so ~12 px glyphs, never scaled to ~5 px)
    const smallText = await page.evaluate(() =>
      [...document.querySelectorAll('svg text')].filter(
        (el) => el.getBoundingClientRect().height < 9,
      ).length,
    );
    expect(smallText).toBe(0);

    // no two axis-title boxes overlap (Y1 top-left vs Y2 top-right on detail)
    const boxes = await dp.locator('svg text').evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { t: e.textContent ?? '', l: r.left, r: r.right };
      }),
    );
    const titles = boxes.filter((b) => /front-end|backend ops|Latency \(ms\)/.test(b.t));
    expect(titles.length).toBeGreaterThanOrEqual(2);
    for (const a of titles)
      for (const c of titles) if (a !== c) expect(a.l > c.r || c.l > a.r).toBe(true);

    await dp.scrollIntoViewIfNeeded();
    await shot(page, 'mobile-detail');
  });
});
