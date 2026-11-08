// Probe: register via join UI, capture state transitions.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
page.on('request', (r) => {
  if (r.url().includes('/api/')) console.log('REQ →', r.method(), r.url().replace('http://localhost:5173', ''));
});
page.on('response', (r) => {
  if (r.url().includes('/api/')) console.log('RES ←', r.status(), r.url().replace('http://localhost:5173', ''));
});

await page.goto('http://localhost:5173//join', { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
console.log('kicker/swapped ok — btn label:', (await page.textContent('.join-btn')).trim());

await page.fill('input[name=email]', 'fresh@quadly.dev');
await page.fill('input[name=password]', 'secret123');
await page.fill('input[name=confirm]', 'secret123');
console.log('values:', JSON.stringify({
  email: await page.inputValue('input[name=email]'),
  pw: await page.inputValue('input[name=password]'),
  confirm: await page.inputValue('input[name=confirm]'),
}));
console.log('btn disabled?', await page.locator('.join-btn').isDisabled().catch(() => 'n/a'));

await page.click('.join-btn');
await page.waitForTimeout(1500);
console.log('after click btn label:', (await page.textContent('.join-btn').catch(() => '(gone)')).trim());
console.log('status count:', await page.locator('.join-status').count());
console.log('status text:', (await page.textContent('.join-status').catch(() => '(none)')).trim());
console.log('hash:', await page.evaluate(() => location.hash));
console.log('errors:', errors.length ? errors : '(none)');
await page.screenshot({ path: '/tmp/join-email-probe.png' });
await browser.close();
