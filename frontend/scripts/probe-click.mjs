// Probe: does the Connect button receive the DOM click at all?
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

await page.fill('.ob-input--row', 'torvalds');

const before = await page.evaluate(() => {
  const btn = document.querySelector('.ob-btn--row');
  window.__clicks = 0;
  btn.addEventListener('click', () => {
    window.__clicks += 1;
  });
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const top = document.elementFromPoint(cx, cy);
  return {
    disabled: btn.disabled,
    pointerEvents: getComputedStyle(btn).pointerEvents,
    rectX: Math.round(rect.x),
    rectY: Math.round(rect.y),
    topIsButton: top === btn,
    topClass: top ? String(top.className).slice(0, 60) : '(none)',
  };
});
console.log('before click:', JSON.stringify(before));

await page.click('.ob-btn--row');
await page.waitForTimeout(700);
const after = await page.evaluate(() => ({
  domClicks: window.__clicks,
  dots: document.querySelectorAll('.ob-dots').length,
  cards: document.querySelectorAll('.ob-gh-card').length,
}));
console.log('after click:', JSON.stringify(after));

await page.screenshot({ path: '/tmp/ob-click-probe.png' });
await browser.close();
