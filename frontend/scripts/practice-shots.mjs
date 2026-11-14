// Practice screenshots — a dev QA tool, not part of the product.
// Drives the real app (dev vite on 5199 -> backend on 4000) through the
// Practice screens and states, at 360 / 768 / 1280 in dark and light.
// Usage:  cd frontend && node scripts/practice-shots.mjs [outdir]
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.SHOTS_BASE || 'http://localhost:5199';
const API = `${BASE}/api`;
const OUT = process.argv[2] || '/tmp/practice-shots';
const SIZES = [
  ['360', 360, 740],
  ['768', 768, 900],
  ['1280', 1280, 860],
];
const THEMES = ['dark', 'light'];

const stamp = Date.now();
const EMAIL = `shots${stamp}@t.dev`;
const GOOD_BODY = {
  happened: 'The checkout API refused every payment between 09:37 and 10:05 because its TLS certificate had expired at 23:59 UTC the night before.',
  impact: 'Zero completed orders for 28 minutes — about 4,200 failed payments and 38 support tickets.',
  rootCause: 'The TLS certificate on checkout-api expired overnight; the renewal job failed with exit code 1 last week with no retry.',
  fix: 'Reissued the certificate and deployed it to every instance of checkout-api, then verified the renewal job.',
  prevention: 'Add an expiry alert 14 days out, make the renewal job retry with paging on failure, and review the certificate checklist monthly.',
};

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${JSON.stringify(json || '')}`);
  return json;
};

const browser = await chromium.launch();
let n = 0;

async function freshPage(width, height, theme, token) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addInitScript(([t, th]) => {
    localStorage.setItem('quadly:token', t);
    localStorage.setItem('quadly:theme', JSON.stringify(th));
  }, [token, theme]);
  return { ctx, page };
}

async function shot(page, name) {
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  n += 1;
  console.log('shot', name);
}

async function artPerState(name, fn, token, sizes = SIZES, themes = THEMES) {
  // fn(page) runs the interactions once, then only the screenshots repeat:
  // simplest robust loop — rerun the interactions per variant.
  for (const [wLabel, w, h] of sizes) {
    for (const theme of themes) {
      const { ctx, page } = await freshPage(w, h, theme, token);
      try {
        await fn(page);
        await shot(page, `${name}-${wLabel}-${theme}`);
      } catch (e) {
        console.log(`FAILED ${name}-${wLabel}-${theme}: ${e.message}`);
      } finally {
        await ctx.close();
      }
    }
  }
}

// ---- seed two students + states over the API ----
const register = async (email) => {
  const r = await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } });
  await api('/onboarding', {
    method: 'POST',
    token: r.token,
    body: { email, name: 'Asha Verma', college: 'Oregon State', track: 'Software Engineering', role: 'SDE', year: '3rd year', dailyTime: '30 minutes a day' },
  });
  return r.token;
};

const studentFresh = await register(`fresh${stamp}@t.dev`);
const studentMain = await register(EMAIL);
const studentRoom = await register(`room${stamp}@t.dev`);

// A resolved cert incident on the main student.
const start = await api('/practice/incidents/inc-cert-01/start', { method: 'POST', token: studentMain });
const att = start.attempt.attemptId;
await api(`/practice/incidents/${att}/action`, { method: 'POST', token: studentMain, body: { actionId: 'open-dashboard' } });
await api(`/practice/incidents/${att}/action`, { method: 'POST', token: studentMain, body: { actionId: 'read-logs-checkout' } });
await api(`/practice/incidents/${att}/hypothesis`, {
  method: 'POST', token: studentMain,
  body: { text: 'The logs point at a TLS certificate that expired overnight, so renewal is the fix.', notes: 'check the renewal job too' },
});
await api(`/practice/incidents/${att}/resolve`, { method: 'POST', token: studentMain, body: { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert' } });
const pm = await api('/practice/postmortems', { method: 'POST', token: studentMain, body: { attemptId: att, body: GOOD_BODY } });
const share = await api(`/practice/work-record/${att}/share`, { method: 'POST', token: studentMain, body: { share: true } });

// The main student's drill, answered (drives the streak + answered screens).
const today = await api('/practice/drill/today', { token: studentMain });
const answered = await api(`/practice/drill/${today.drill.id}/answer`, { method: 'POST', token: studentMain, body: { optionIndex: 0 } });

// A fresh active attempt on the S3 scenario (the "with evidence" room shot)
// on a dedicated student, so weekly-start caps never interfere.
const s3 = await api('/practice/incidents/inc-s3-01/start', { method: 'POST', token: studentRoom });
const s3Att = s3.attempt.attemptId;
await api(`/practice/incidents/${s3Att}/action`, { method: 'POST', token: studentRoom, body: { actionId: 'check-status-boards' } });
await api(`/practice/incidents/${s3Att}/action`, { method: 'POST', token: studentRoom, body: { actionId: 'read-storage-logs' } });

await mkdir(OUT, { recursive: true });
console.log('students ready. main =', EMAIL);

// ---- screens ----

// Practice home — the fresh student (level card, drill ready)
await artPerState('home-fresh', async (page) => {
  await page.goto(`${BASE}/app/practice`);
  await page.waitForSelector('.qd-pr-cardtitle');
}, studentFresh);

// Practice home — the working student (drill done, recent work)
await artPerState('home-active', async (page) => {
  await page.goto(`${BASE}/app/practice`);
  await page.waitForSelector('.qd-pr-cardtitle');
}, studentMain);

// Daily drill — the fresh student sees the question
await artPerState('drill-question', async (page) => {
  await page.goto(`${BASE}/app/practice/drill`);
  await page.waitForSelector('.qd-pr-question');
  await page.click('.qd-pr-opt >> nth=0');
}, studentFresh);

// Daily drill — answered, takeaway and teaser visible
await artPerState('drill-answered', async (page) => {
  await page.goto(`${BASE}/app/practice/drill`);
  await page.waitForSelector('.qd-pr-takeaway');
}, studentMain, [['1280', 1280, 860]]);

// Incident room — guided scenario, no actions yet (fresh student, cap-free)
await artPerState('room-guided', async (page) => {
  await page.goto(`${BASE}/app/practice/incident?scenario=inc-cert-01`);
  await page.waitForSelector('.qd-pr-act');
}, studentFresh);

// Incident room — with evidence collected (S3, standard)
await artPerState('room-evidence', async (page) => {
  await page.goto(`${BASE}/app/practice/incident?attempt=${s3Att}`);
  await page.waitForSelector('.qd-pr-latesttitle');
}, studentRoom);

// Incident reveal — resolved through the UI on a fresh guided attempt
await artPerState('reveal', async (page) => {
  await page.goto(`${BASE}/app/practice/incident?scenario=inc-cert-01`);
  await page.waitForSelector('.qd-pr-act');
  await page.click('.qd-pr-opt >> nth=0'); // first root cause
  await page.evaluate(() => {
    document.querySelectorAll('.qd-pr-resolve .qd-pr-fieldset')[1].querySelectorAll('.qd-pr-opt')[0].click();
  });
  await page.click('button:has-text("Resolve the incident")');
  await page.waitForSelector('.qd-pr-reveal');
  await page.waitForTimeout(600); // stagger lands
}, studentFresh, [['1280', 1280, 860]]);

// Postmortem editor — filled, saved, critique and rubric rendered
await artPerState('postmortem-critique', async (page) => {
  await page.goto(`${BASE}/app/practice/postmortem?attempt=${att}`);
  await page.waitForSelector('.qd-pr-pmarea');
  const areas = page.locator('.qd-pr-pmarea');
  const fill = [GOOD_BODY.happened, GOOD_BODY.impact, GOOD_BODY.rootCause, GOOD_BODY.fix, GOOD_BODY.prevention];
  for (let i = 0; i < 5; i += 1) await areas.nth(i).fill(fill[i]);
  await page.click('button:has-text("Save")');
  await page.waitForSelector('.qd-pr-rubriclist');
}, studentMain, [['1280', 1280, 860]]);

// Work record + share link
await artPerState('record', async (page) => {
  await page.goto(`${BASE}/app/practice/record?attempt=${att}`);
  await page.waitForSelector('.qd-pr-sharelink');
}, studentMain);

// Public shared record — no auth
await artPerState('public-record', async (page) => {
  await page.goto(`${BASE}/shared-record/${share.token}`);
  await page.waitForSelector('.srec-pm');
}, 'none');

await browser.close();
console.log(`done: ${n} screenshots in ${OUT}`);
