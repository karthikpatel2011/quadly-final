// Probe: ambassador lookup — browser request flow during college typing.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('request', (r) => {
  if (r.url().includes('/api/')) console.log('REQ →', r.method(), r.url().replace('http://localhost:5173', ''));
});
page.on('response', (r) => {
  if (r.url().includes('/api/')) console.log('RES ←', r.status(), r.url().slice(0, 90));
});

await page.goto('http://localhost:5173//onboarding', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);

await page.fill('.ob-input', 'Verify User');
await page.keyboard.press('Enter');
await page.waitForTimeout(700); // let the step transition fully settle

await page.fill('.ob-input', 'CBIT Hyderabad');
for (const w of [400, 800, 1500, 2500]) {
  await page.waitForTimeout(w);
  const card = await page.locator('.ob-amb-card').count();
  const btn = (await page.locator('.ob-ask').count().catch(() => -1));
  const hint = (await page.textContent('.ob-hint').catch(() => '')).trim().slice(0, 70);
  console.log('+' + w + 'ms → card ' + card + ' | ask ' + btn + ' | hint ' + JSON.stringify(hint));
}
console.log('errors:', errors.length ? errors : '(none)');
await page.screenshot({ path: '/tmp/ob-lookup-probe.png' });
await browser.close();
