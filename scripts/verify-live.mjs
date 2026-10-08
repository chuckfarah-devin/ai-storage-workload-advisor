// Verifies the deployed GitHub Pages build (not the dev server).
// Usage: node scripts/verify-live.mjs [baseUrl]
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'https://chuckfarah-devin.github.io/ai-storage-workload-advisor/';
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const resp = await page.goto(base, { waitUntil: 'networkidle' });

check('index page loads', resp.status() === 200, `HTTP ${resp.status()}`);
check('page title', (await page.title()) === 'AI Storage Workload Advisor', await page.title());

// asset loading: the built JS bundle must resolve under the repo base path
const asset = await page.evaluate(async () => {
  const src = document.querySelector('script[type="module"]')?.src
    ?? [...document.scripts].map((s) => s.src).find((s) => s.includes('assets/'));
  if (!src) return { ok: false, src: 'none found' };
  const r = await fetch(src, { method: 'HEAD' });
  return { ok: r.ok, src };
});
check('JS bundle resolves', asset.ok, asset.src);

const detail = page.locator('section.panel').filter({ hasText: 'Detail day' });
const fullDay = detail.getByRole('button', { name: 'Full day' });
const morning = detail.getByRole('button', { name: 'Morning burst' });

// preset selection state
await page.getByLabel('Proposed workload').selectOption('WL-VM');
check('Full day selected on load',
  (await fullDay.getAttribute('aria-pressed')) === 'true' &&
  (await detail.locator('button[aria-pressed="true"]').count()) === 1);

await morning.click();
const style = await morning.evaluate((el) => {
  const cs = getComputedStyle(el);
  return { border: cs.borderColor, weight: cs.fontWeight, shadow: cs.boxShadow, pressed: el.getAttribute('aria-pressed') };
});
check('Morning burst selected + styled',
  style.pressed === 'true' && style.shadow !== 'none' && parseInt(style.weight) >= 600,
  `aria-pressed=${style.pressed} weight=${style.weight} shadow=${style.shadow.slice(0, 40)}…`);
check('exactly one pressed preset', (await detail.locator('button[aria-pressed="true"]').count()) === 1);

// day change resets to Full day
await detail.getByLabel('Detail day').selectOption('5');
check('day change resets to Full day',
  (await fullDay.getAttribute('aria-pressed')) === 'true' &&
  (await morning.getAttribute('aria-pressed')) === 'false');

// RAG workload details + phase bandwidth
await page.getByLabel('Proposed workload').selectOption('WL-RAG');
const det = page.locator('details').filter({ hasText: 'Workload details' });
await det.locator('summary').click();
const detText = await det.textContent();
check('RAG deployment assumption shown', detText.includes('self-hosted vector/search service') && detText.includes('not a requirement of RAG'));
check('phases + scope limits shown', detText.includes('query-time retrieval') && detText.includes('GPU inference'));
check('derived ingestion bandwidth', detText.includes('1.31 GB/s') && detText.includes('02:00–05:00') && detText.includes('substantial synthetic assumption'));

// mobile spot check: no horizontal overflow at 375px
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(base, { waitUntil: 'networkidle' });
const sw = await page.evaluate(() => document.documentElement.scrollWidth);
check('no horizontal overflow at 375px', sw <= 375, `scrollWidth=${sw}`);

await browser.close();
console.log(failures === 0 ? '\nAll live checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
