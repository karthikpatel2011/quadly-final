// Playwright screenshot helper for visual QA.
// Usage: node scripts/shot.mjs <url> <outfile> [full=1|0] [width=1400] [motion=auto|reduce]
import { chromium } from 'playwright';

const [url = 'http://localhost:5173/', out = 'shot.png', full = '1', width = '1400', motion = 'auto'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
if (motion === 'reduce') {
  // Freeze CSS animations in their final (visible) state.
  await page.emulateMedia({ reducedMotion: 'reduce' });
}
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // let webfonts settle
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
console.log('saved', out);
