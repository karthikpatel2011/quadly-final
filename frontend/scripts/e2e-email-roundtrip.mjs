// E2E: register with email through the UI, continue to onboarding, finish.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });

await page.goto('http://localhost:5173//join', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// Sign-up mode with email + password + confirm
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.fill('input[name=email]', 'priya@quadly.dev');
await page.fill('input[name=password]', 'secret123');
await page.fill('input[name=confirm]', 'secret123');
await page.click('.join-btn');
await page.waitForTimeout(900);
console.log('register msg:', (await page.textContent('.join-status')).trim());
console.log('stored email:', await page.evaluate(() => localStorage.getItem('quadly:email')));

await page.click('text=Continue to setup');
await page.waitForTimeout(700);
console.log('landed on:', (await page.textContent('.ob-card-step')).trim());

await page.fill('.ob-input', 'Aarav Sharma');
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
await page.fill('.ob-input', 'Vasavi College of Engineering');
await page.waitForSelector('.ob-amb-card', { timeout: 8000 });
await page.click('text=Yes');
await page.waitForTimeout(500);
await page.fill('.ob-input', 'Google');
await page.click('.ob-chips >> text=SDE');
await page.click('.ob-btn');
await page.waitForTimeout(300);
await page.click('text=Skip for now');
await page.waitForTimeout(1100);
console.log('onboarding save:', (await page.textContent('.ob-hint--ok, .ob-hint--error')).trim());

const doc = JSON.parse(await readFile('../backend/data/onboarding-profiles.json', 'utf8'));
console.log('document record:', JSON.stringify({ email: doc[0]?.email, name: doc[0]?.name, ambassador: doc[0]?.ambassador?.name ?? null, github: doc[0]?.github }));

await browser.close();
