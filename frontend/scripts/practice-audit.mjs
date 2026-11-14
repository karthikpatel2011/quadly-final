// Practice UI audit — the scripted version of a design review. For every
// screen × viewport × theme it walks the real app in a real Chromium and
// asserts the design-system contract where it can be computed:
//   · no horizontal overflow (360 especially)
//   · interactive controls are inside the viewport and tall enough to tap
//   · cards are flat: no gradients, no glow (computed background-image)
//   · body text meets WCAG 4.5:1 against its actual painted background
//   · the page really rendered the screen (content probes)
// Usage:  cd frontend && node scripts/practice-audit.mjs
import { chromium } from 'playwright';

const BASE = process.env.SHOTS_BASE || 'http://localhost:5199';
const API = `${BASE}/api`;
const stamp = Date.now();
const SIZES = [[360, 740], [768, 900], [1280, 860]];

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return json;
};

const register = async (email) => {
  const r = await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } });
  await api('/onboarding', {
    method: 'POST', token: r.token,
    body: { email, name: 'Asha Verma', college: 'Oregon State', track: 'Software Engineering', role: 'SDE', year: '3rd year', dailyTime: '30 minutes a day' },
  });
  return r.token;
};

const GOOD_BODY = {
  happened: 'The checkout API refused every payment between 09:37 and 10:05 because its TLS certificate had expired at 23:59 UTC the night before.',
  impact: 'Zero completed orders for 28 minutes — about 4,200 failed payments and 38 support tickets.',
  rootCause: 'The TLS certificate on checkout-api expired overnight; the renewal job failed with exit code 1 last week with no retry.',
  fix: 'Reissued the certificate and deployed it to every instance of checkout-api, then verified the renewal job.',
  prevention: 'Add an expiry alert 14 days out, make the renewal job retry with paging on failure, and review the certificate checklist monthly.',
};

const tMain = await register(`audit${stamp}@t.dev`);
const tRoom = await register(`room${stamp}@t.dev`);
const tFresh = await register(`fresh${stamp}@t.dev`);

// A resolved incident + postmortem + share on the main student.
const start = await api('/practice/incidents/inc-cert-01/start', { method: 'POST', token: tMain });
const att = start.attempt.attemptId;
await api(`/practice/incidents/${att}/action`, { method: 'POST', token: tMain, body: { actionId: 'open-dashboard' } });
await api(`/practice/incidents/${att}/action`, { method: 'POST', token: tMain, body: { actionId: 'read-logs-checkout' } });
await api(`/practice/incidents/${att}/resolve`, { method: 'POST', token: tMain, body: { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert' } });
await api('/practice/postmortems', { method: 'POST', token: tMain, body: { attemptId: att, body: GOOD_BODY } });
const share = await api(`/practice/work-record/${att}/share`, { method: 'POST', token: tMain, body: { share: true } });
const today = await api('/practice/drill/today', { token: tMain });
await api(`/practice/drill/${today.drill.id}/answer`, { method: 'POST', token: tMain, body: { optionIndex: 0 } });

// An active S3 room with evidence on the room student.
const s3 = await api('/practice/incidents/inc-s3-01/start', { method: 'POST', token: tRoom });
const s3Att = s3.attempt.attemptId;
await api(`/practice/incidents/${s3Att}/action`, { method: 'POST', token: tRoom, body: { actionId: 'check-status-boards' } });
await api(`/practice/incidents/${s3Att}/action`, { method: 'POST', token: tRoom, body: { actionId: 'read-storage-logs' } });

const THEMES = ['dark', 'light'];
const SCREENS = [
  { name: 'home-fresh', token: tFresh, path: '/app/practice', probe: '.qd-pr-cardtitle' },
  { name: 'home-active', token: tMain, path: '/app/practice', probe: '.qd-pr-recentlist' },
  { name: 'drill-question', token: tFresh, path: '/app/practice/drill', probe: '.qd-pr-opts' },
  { name: 'drill-answered', token: tMain, path: '/app/practice/drill', probe: '.qd-pr-takeaway' },
  { name: 'room-guided', token: tFresh, path: '/app/practice/incident?scenario=inc-cert-01', probe: '.qd-pr-resolve' },
  { name: 'room-evidence', token: tRoom, path: `/app/practice/incident?attempt=${s3Att}`, probe: '.qd-pr-latesttitle' },
  { name: 'postmortem', token: tMain, path: `/app/practice/postmortem?attempt=${att}`, probe: '.qd-pr-pmarea' },
  { name: 'record', token: tMain, path: `/app/practice/record?attempt=${att}`, probe: '.qd-pr-sharelink' },
  { name: 'public-record', token: null, path: `/shared-record/${share.token}`, probe: '.srec-pm' },
];

// In-page audit — everything that can be measured, is measured.
async function auditInPage(page, screenName, width) {
  return page.evaluate(({ screenName, width }) => {
    const issues = [];
    const vw = window.innerWidth;

    // 1. Horizontal overflow — the 360 handoff must never scroll sideways.
    if (document.documentElement.scrollWidth > vw + 1) {
      issues.push(`horizontal overflow: scrollWidth ${document.documentElement.scrollWidth} > viewport ${vw}`);
    }

    // 2. Cards stay flat — no gradients or glows anywhere in the tree.
    for (const el of document.querySelectorAll('.qd-card, .srec-card')) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') issues.push(`${el.className.split(' ')[0]} paints a background image (${bg.slice(0, 40)}…)`);
    }

    // 3. Interactive controls: visible, inside the viewport, tall enough to tap.
    for (const el of document.querySelectorAll('button, [role="radio"], [role="menuitem"], a')) {
      if (el.offsetParent === null) continue; // hidden / inside unopened menus
      const r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      if (r.right > vw + 1 || r.left < -1) issues.push(`control escapes the viewport: "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}"`);
      if (el.tagName === 'BUTTON' && r.height > 0 && r.height < 20) issues.push(`button too small to tap (${Math.round(r.height)}px): "${(el.textContent || '').trim().slice(0, 24)}"`);
    }

    // 4. WCAG contrast: body-ish text vs the nearest painted surface.
    const lum = (c) => {
      const [r, g, b] = c.match(/\d+(\.\d+)?/g).slice(0, 3).map((x) => {
        const v = Number(x) / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const la = lum(a); const lb = lum(b);
      const [hi, lo] = la > lb ? [la, lb] : [lb, la];
      return (hi + 0.05) / (lo + 0.05);
    };
    const bgOf = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !bg.startsWith('rgba(0, 0, 0, 0)') && !bg.startsWith('rgba(0,0,0,0)')) {
          const m = bg.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
          if (m && Number(m[3]) < 254) return bg; // a real dark/light surface
        }
        node = node.parentElement;
      }
      return getComputedStyle(document.documentElement).backgroundColor;
    };
    const textSamples = [
      ['.qd-muted, .qd-pr-leveltier, .qd-pr-recentmeta', 'muted text'],
      ['.qd-pr-tlbody, .qd-pr-why, .qd-pr-logline', 'body/log text'],
      ['h2, .qd-pr-cardtitle, .srec-title', 'heading text'],
    ];
    for (const [sel, label] of textSamples) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) {
        const fg = getComputedStyle(el).color;
        const r = ratio(fg, bgOf(el));
        if (r < 4.5) issues.push(`${label} contrast ${(r).toFixed(2)}:1 (< 4.5)`);
      }
    }
    // Primary buttons must read white-on-accent-with-light-text per tokens.
    const btn = document.querySelector('.qd-btn--primary');
    if (btn && btn.offsetParent !== null) {
      const r = ratio(getComputedStyle(btn).color, getComputedStyle(btn).backgroundColor);
      if (r < 4.5) issues.push(`primary button contrast ${(r).toFixed(2)}:1`);
    }

    return { screenName, issues };
  }, { screenName, width });
}

const browser = await chromium.launch();
let totalIssues = 0;
let checks = 0;

for (const [w, h] of SIZES) {
  for (const theme of THEMES) {
    for (const screen of SCREENS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      if (screen.token) {
        await page.addInitScript(([t, th]) => {
          localStorage.setItem('quadly:token', t);
          localStorage.setItem('quadly:theme', JSON.stringify(th));
        }, [screen.token, theme]);
      } else {
        await page.addInitScript(([th]) => {
          localStorage.setItem('quadly:theme', JSON.stringify(th));
        }, [theme]);
      }
      try {
        await page.goto(`${BASE}${screen.path}`);
        await page.waitForSelector(screen.probe, { timeout: 15000 });
        await page.waitForTimeout(150);
        const result = await auditInPage(page, `${screen.name}-${w}-${theme}`, w);
        checks += 1;
        if (result.issues.length) {
          totalIssues += result.issues.length;
          console.log(`✗ ${result.screenName}`);
          for (const i of result.issues) console.log(`   - ${i}`);
        } else {
          console.log(`✓ ${result.screenName}`);
        }
      } catch (e) {
        totalIssues += 1;
        console.log(`✗ ${screen.name}-${w}-${theme}: FAILED TO RENDER (${e.message.split('\n')[0]})`);
      } finally {
        await ctx.close();
      }
    }
  }
}

await browser.close();
console.log(`\n${checks} screen-variant audits ran; ${totalIssues} issue(s) found.`);
process.exit(totalIssues > 0 ? 1 : 0);
