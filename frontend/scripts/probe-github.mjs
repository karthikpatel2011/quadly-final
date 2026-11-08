// E2E: github connect probe with network logging.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
page.on('request', (r) => {
  if (r.url().includes('/api/')) console.log('REQ →', r.method(), r.url().replace('http://localhost:5173', ''));
});
page.on('response', (r) => {
  if (r.url().includes('/api/')) console.log('RES ←', r.status(), r.url().replace('http://localhost:5173', ''));
});

await page.goto('http://localhost:5173//onboarding', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await page.fill('.ob-input', 'Aarav Sharma');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);

await page.fill('.ob-input', 'IIT Madras');
await page.waitForTimeout(1400);
await page.click('.ob-btn');
await page.waitForTimeout(400);

await page.fill('.ob-input', 'Google');
await page.click('.ob-chips >> text=SDE');
await page.click('.ob-btn');
await page.waitForTimeout(500);
console.log('kicker:', (await page.textContent('.ob-kicker')).trim());

await page.fill('.ob-input--row', 'torvalds');
console.log('input value:', await page.inputValue('.ob-input--row'));
await page.click('text=Connect');
for (const w of [400, 800, 1500, 3000]) {
  await page.waitForTimeout(w);
  const btn = (await page.textContent('.ob-btn--row').catch(() => '(gone)')).trim().slice(0, 20);
  const dots = await page.locator('.ob-dots').count();
  const card = await page.locator('.ob-gh-card').count();
  console.log('+' + w + 'ms → button ' + JSON.stringify(btn) + ' dots ' + dots + ' card ' + card);
}
await page.screenshot({ path: '/tmp/ob-gh-debug2.png' });
await browser.close();
