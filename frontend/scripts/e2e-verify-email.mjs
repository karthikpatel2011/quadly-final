// Verify the email lands in the onboarding document.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });

await page.goto('http://localhost:5173//join', { waitUntil: 'networkidle' });
const email = `verify+${Date.now()}@quadly.dev`;
await page.fill('input[name=email]', email);
await page.fill('input[name=password]', 'secret123');
await page.fill('input[name=confirm]', 'secret123');
await page.click('.join-btn');
await page.waitForSelector('.join-next', { timeout: 8000 });
console.log('register:', (await page.textContent('.join-status')).trim());
await page.click('text=Continue to setup');
await page.waitForTimeout(600);
await page.fill('.ob-input', 'Verify User');
await page.keyboard.press('Enter');
await page.waitForTimeout(750); // let the step push finish before touching the next input
await page.fill('.ob-input', 'CBIT Hyderabad');
await page.waitForTimeout(1600);
await page.click('text=Yes');
await page.waitForTimeout(400);
await page.fill('.ob-input', 'Microsoft');
await page.click('.ob-chips >> text=Full-Stack');
await page.click('.ob-btn');
await page.waitForTimeout(300);
await page.click('text=Skip for now');
await page.waitForTimeout(1100);

const doc = JSON.parse(await readFile('../backend/data/onboarding-profiles.json', 'utf8'));
console.log(JSON.stringify(doc[doc.length - 1], null, 1));

await browser.close();
