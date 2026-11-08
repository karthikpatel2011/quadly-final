// E2E: full onboarding — ambassador found + GitHub, then not-found + skip.
// Usage: node scripts/e2e-onboarding.mjs
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch();

// ── Run 1: ambassador found + GitHub connect ──
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
  await page.goto('http://localhost:5173//onboarding', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  await page.fill('.ob-input', 'Aarav Sharma');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  console.log('Q1 → Q2:', (await page.textContent('.ob-card-step')).trim());

  await page.fill('.ob-input', 'Vasavi College of Engineering');
  await page.waitForSelector('.ob-amb-card', { timeout: 8000 });
  console.log('ambassador found:', (await page.textContent('.ob-amb-card strong')).trim());
  await page.screenshot({ path: '/tmp/ob-2-ambassador.png' });

  await page.click('text=Yes');
  await page.waitForTimeout(650);
  console.log('yes → Q3:', (await page.textContent('.ob-card-step')).trim());

  await page.click('.ob-back');
  await page.waitForTimeout(650);
  console.log('back → Q2:', (await page.textContent('.ob-card-step')).trim());
  await page.click('.ob-btn');
  await page.waitForTimeout(650);

  await page.fill('.ob-input', 'Google');
  await page.click('.ob-chips >> text=SDE');
  await page.click('.ob-btn');
  await page.waitForTimeout(600);
  console.log('target → github:', (await page.textContent('.ob-card-step')).trim());

  await page.fill('.ob-input--row', 'torvalds');
  await page.click('.ob-btn--row');
  await page.waitForSelector('.ob-gh-card', { timeout: 10000 });
  console.log('github:', (await page.textContent('.ob-gh-check')).trim(), '|', (await page.textContent('.ob-gh-meta strong')).trim());
  await page.screenshot({ path: '/tmp/ob-3-github.png' });

  await page.click('.ob-btn--row >> text=Continue');
  await page.waitForTimeout(1100);
  console.log('done save:', (await page.textContent('.ob-hint--ok, .ob-hint--error')).trim());
  await page.screenshot({ path: '/tmp/ob-4-done.png' });
  await page.close();
}

// ── Run 2: ambassador not found + GitHub skipped ──
{
  const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
  await page.goto('http://localhost:5173//onboarding', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  await page.fill('.ob-input', 'Priya Nair');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  await page.fill('.ob-input', 'IIT Madras');
  await page.waitForTimeout(1600);
  const note = (await page.textContent('.ob-hint').catch(() => '')).trim();
  console.log('not-found note:', note.slice(0, 60));
  await page.screenshot({ path: '/tmp/ob-5-noamb.png' });

  await page.click('.ob-btn');
  await page.waitForTimeout(600);
  await page.fill('.ob-input', 'Zoho');
  await page.click('.ob-chips >> text=Data Analyst');
  await page.click('.ob-btn');
  await page.waitForTimeout(600);
  await page.click('text=Skip for now');
  await page.waitForTimeout(1100);
  console.log('run2 save:', (await page.textContent('.ob-hint--ok, .ob-hint--error')).trim());
  await page.close();
}

await browser.close();

const doc = JSON.parse(await readFile('../backend/data/onboarding-profiles.json', 'utf8'));
console.log('document records:', doc.length);
for (const p of doc) {
  console.log(' •', JSON.stringify({ name: p.name, college: p.college, ambassador: p.ambassador?.name ?? null, company: p.target?.company, role: p.target?.role, github: p.github }));
}
