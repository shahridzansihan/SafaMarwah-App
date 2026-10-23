// Browser smoke test for SafaMarwah design-preservation branch.
// Run with: npm install --no-save playwright && npx playwright install chromium
// Start a local server on 8765, then: node scripts/visual_smoke.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.SMOKE_URL || 'http://127.0.0.1:8765/';
const output = 'artifacts/design-smoke';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet-portrait', width: 820, height: 1180 },
  { name: 'tablet-landscape', width: 1180, height: 820 },
  { name: 'desktop', width: 1440, height: 900 },
];
let failures = 0;
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    const state = await page.evaluate(() => ({
      title: document.title,
      theme: document.querySelector('meta[name="theme-color"]')?.content,
      mainExists: Boolean(document.querySelector('#main')),
      mainVisible: (() => { const el = document.querySelector('#main'); return Boolean(el && el.getBoundingClientRect().height > 0); })(),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      footerExists: Boolean(document.querySelector('nav.bottom, .bottom')),
    }));
    await page.screenshot({ path: `${output}/${viewport.name}.png`, fullPage: true });
    const issues = [
      ...(response?.ok() ? [] : [`HTTP ${response?.status() ?? 'no response'}`]),
      ...(!state.mainExists || !state.mainVisible ? ['main missing or not visible'] : []),
      ...(state.horizontalOverflow ? ['horizontal overflow'] : []),
      ...(!state.footerExists ? ['footer missing'] : []),
      ...(state.theme !== '#14382E' ? [`theme color ${state.theme}`] : []),
      ...errors.map(e => `page error: ${e}`),
    ];
    if (issues.length) failures++;
    console.log(`${issues.length ? 'FAIL' : 'PASS'} ${viewport.name}: ${JSON.stringify({ ...state, issues })}`);
    await page.close();
  }
} finally {
  await browser.close();
}
if (failures) process.exitCode = 1;
