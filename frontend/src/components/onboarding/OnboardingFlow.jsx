import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { apiFetch } from '../../lib/api.js';
import Logo from '../Logo.jsx';
import './onboarding-flow.css';

/* Onboarding — the PRD v4.0 phase-1 flow: eight questions, tap-only, about
   90 seconds. Every finished step persists immediately (server draft for
   signed-up students, local draft for visitors), so a closed tab loses
   nothing. The last screen shows the student's real generated plan plus a
   "why this plan" line per answer. Composition: blue headline field on top,
   dark question card straddling the blue→black fall. Step motion is pure
   CSS (right→left pushes); GSAP only stages the first entrance. */

// Mirrors backend/src/lib/personalize.js — keep both lists identical.
const TRACK_OPTIONS = ['Software Engineering', 'AI & ML', 'Cyber Security', 'Not sure'];
const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year', 'Completed'];
const DAILY_TIME_OPTIONS = ['15 minutes a day', '30 minutes a day', '45 minutes a day', '1 hour a day'];
const PRACTICE_TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];
const SELF_RATING_OPTIONS = ['Just starting', 'Know the basics', 'Can build small things', 'Nearly job-ready'];
const ROLE_OPTIONS_BY_TRACK = {
  'Software Engineering': ['Backend developer', 'Frontend developer', 'Full-stack developer', 'QA engineer', 'DevOps engineer'],
  'AI & ML': ['AI/ML engineer', 'Data scientist', 'Data analyst', 'Data engineer'],
  'Cyber Security': ['Security analyst', 'SOC analyst', 'Penetration tester', 'Security engineer'],
  'Not sure': ['Backend developer', 'AI/ML engineer', 'Data analyst', 'Security analyst'],
};

// Target-date presets — the student's own date, just offered tap-first.
const TARGET_PRESETS = [
  { key: '1m', label: 'In 1 month', months: 1 },
  { key: '3m', label: 'In 3 months', months: 3 },
  { key: '6m', label: 'In 6 months', months: 6 },
  { key: 'custom', label: 'Pick a date', custom: true },
];

const STEPS = ['college', 'track', 'role', 'year', 'daily', 'window', 'target', 'level'];
const PREV_STEP = {
  name: 'welcome', college: 'name', track: 'college', role: 'track',
  year: 'role', daily: 'year', window: 'daily', target: 'window',
  level: 'target', done: 'level',
};
const FILL = { welcome: 0, name: 0, college: 1, track: 2, role: 3, year: 4, daily: 5, window: 6, target: 7, level: 8, done: 8 };

function countLabel(step) {
  if (step === 'welcome') return 'Welcome';
  if (step === 'name') return 'First, your name';
  if (step === 'done') return 'All done';
  const i = STEPS.indexOf(step);
  return `Question ${i + 1} of 8`;
}

function isoPlusMonths(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysFromToday(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return null;
  const target = new Date(iso + 'T00:00:00Z').getTime();
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  return Math.round((target - today) / 86400000);
}

function prettyDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

const DRAFT_KEY = 'quadly:onboardingDraft';
const DRAFT_FIELDS = ['name', 'college', 'track', 'role', 'year', 'dailyTime', 'practiceTime', 'targetDate', 'selfRating', 'phone'];

// The optional WhatsApp nudge number — same rule as the backend's cleanPhone:
// optional leading +, then 8–15 digits. Empty is always valid.
function cleanPhoneInput(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { cleaned: '', valid: true };
  const plus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  const valid = digits.length >= 8 && digits.length <= 15;
  return { cleaned: valid ? (plus ? '+' : '') + digits : raw, valid };
}

function readToken() {
  try {
    return localStorage.getItem('quadly:token') || '';
  } catch {
    return '';
  }
}

export default function OnboardingFlow() {
  const [step, setStep] = useState('welcome');
  const [leaving, setLeaving] = useState(null); // { step, dir }
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [track, setTrack] = useState('');
  const [role, setRole] = useState('');
  const [year, setYear] = useState('');
  const [dailyTime, setDailyTime] = useState('');
  const [practiceTime, setPracticeTime] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetMode, setTargetMode] = useState('');
  const [selfRating, setSelfRating] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState(false);
  const [save, setSave] = useState('idle'); // idle|saving|saved|error
  const [planPreview, setPlanPreview] = useState(null);
  const [why, setWhy] = useState([]);
  const hasToken = Boolean(readToken());
  const shellRef = useRef(null);
  const leaveTimer = useRef(null);
  const restored = useRef(false);
  const savedRef = useRef(false);

  // First-mount entrance (GSAP only here; every step swap is CSS).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.ob-column > *', { y: 16, opacity: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out' });
    }, shellRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // Restore progress. The local draft lands immediately; the server draft
  // (signed students) wins once it arrives — no answer is ever asked twice.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const apply = (draft) => {
      if (!draft || typeof draft !== 'object') return;
      if (draft.name) setName(draft.name);
      if (draft.college) setCollege(draft.college);
      if (draft.track) setTrack(draft.track);
      if (draft.role) setRole(draft.role);
      if (draft.year) setYear(draft.year);
      if (draft.dailyTime) setDailyTime(draft.dailyTime);
      if (draft.practiceTime) setPracticeTime(draft.practiceTime);
      if (draft.targetDate) {
        setTargetDate(draft.targetDate);
        setTargetMode('custom');
      }
      if (draft.selfRating) setSelfRating(draft.selfRating);
      if (draft.phone) setPhone(draft.phone);
    };
    let local = {};
    try {
      local = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') || {};
    } catch {
      /* storage unavailable */
    }
    apply(local);
    if (!hasToken) return undefined;
    apiFetch('/onboarding/draft', { headers: { Authorization: `Bearer ${readToken()}` } })
      .then((res) => { if (res?.profile) apply(res.profile); })
      .catch(() => { /* offline → the local draft still applies */ });
    return undefined;
  }, [hasToken]);

  // Persist one answered field the moment it is confirmed.
  function saveField(field, value) {
    if (!DRAFT_FIELDS.includes(field)) return;
    try {
      const local = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') || {};
      local[field] = value;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(local));
    } catch {
      /* storage unavailable */
    }
    if (!hasToken) return;
    apiFetch('/onboarding/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${readToken()}` },
      body: JSON.stringify({ [field]: value }),
    }).catch(() => { /* the local draft carries the answer either way */ });
  }

  function go(next, dir = 1) {
    if (leaving || next === step) return;
    setLeaving({ step, dir });
    setStep(next);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setLeaving(null), 380);
  }

  function back() {
    if (leaving || !PREV_STEP[step]) return;
    go(PREV_STEP[step], -1);
  }

  // Save once the final screen is reached.
  useEffect(() => {
    if (step !== 'done' || savedRef.current) return undefined;
    savedRef.current = true;
    setSave('saving');
    let email = null;
    try {
      email = localStorage.getItem('quadly:email');
    } catch {
      /* storage unavailable */
    }
    apiFetch('/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(hasToken ? { Authorization: `Bearer ${readToken()}` } : {}),
      },
      body: JSON.stringify({
        email,
        name: name.trim(),
        college: college.trim(),
        track,
        role,
        year,
        dailyTime,
        practiceTime,
        targetDate,
        selfRating,
        phone: cleanPhoneInput(phone).cleaned,
      }),
    })
      .then((res) => {
        setPlanPreview(res.plan ?? null);
        setWhy(Array.isArray(res.why) ? res.why : []);
        setSave('saved');
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* storage unavailable */
        }
      })
      .catch(() => setSave('error'));
    return undefined;
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const fill = FILL[step] ?? 0;
  const roleOptions = ROLE_OPTIONS_BY_TRACK[track || 'Not sure'];
  const firstName = name.trim().split(' ')[0];

  const targetNote = (() => {
    const days = daysFromToday(targetDate);
    if (days === null) return '';
    if (days === 1) return `${prettyDate(targetDate)} — tomorrow.`;
    if (days === 0) return 'That is today — the plan starts counting now.';
    if (days < 0) return 'That date is in the past — pick a day ahead.';
    return `${prettyDate(targetDate)} — ${days} days away.`;
  })();

  const renderStep = (s) => {
    switch (s) {
      case 'welcome':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Welcome to Quadly.</h1>
            <p className="ob-sub">
              Learn by doing: a few focused minutes of real, hands-on practice a
              day on your track. Eight quick questions and your daily plan is
              built — around your time, your pace, and the date that matters.
            </p>
            <button type="button" className="ob-btn" onClick={() => go('name')}>
              Let&rsquo;s go
            </button>
          </div>
        );

      case 'name':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim().length >= 2) {
                saveField('name', name.trim());
                go('college');
              }
            }}
          >
            <h1 className="ob-question">What should we call you?</h1>
            <input
              className="ob-input"
              aria-label="Your name"
              placeholder="Your name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
            <p className="ob-hint">This is how your plan and your coach greet you.</p>
            <button type="submit" className="ob-btn" disabled={name.trim().length < 2}>
              Continue
            </button>
          </form>
        );

      case 'college':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              if (college.trim().length >= 3) {
                saveField('college', college.trim());
                go('track');
              }
            }}
          >
            <h1 className="ob-question">Where do you study?</h1>
            <input
              className="ob-input"
              aria-label="Your college"
              placeholder="Start typing your college"
              autoFocus
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              maxLength={80}
            />
            <p className="ob-hint">Saved on your profile only — it never shapes your tasks.</p>
            <button type="submit" className="ob-btn" disabled={college.trim().length < 3}>
              Continue
            </button>
          </form>
        );

      case 'track':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Pick your track.</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Track">
              {TRACK_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={track === t}
                  className={`ob-chip ob-chip--big${track === t ? ' is-on' : ''}`}
                  onClick={() => {
                    setTrack(t);
                    if (role && !(ROLE_OPTIONS_BY_TRACK[t] || []).includes(role)) setRole('');
                    saveField('track', t);
                    go('role');
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="ob-hint">Tasks, path and interview practice all follow this — you can change it anytime.</p>
          </div>
        );
      case 'role':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              if (role) {
                saveField('role', role);
                go('year');
              }
            }}
          >
            <h1 className="ob-question">Any target role yet?</h1>
            <p className="ob-sub">
              {track === 'Not sure'
                ? 'No pressure — pick the closest; your path stays flexible.'
                : `Common first roles on the ${track} track.`}
            </p>
            <div className="ob-chips" role="radiogroup" aria-label="Target role">
              {roleOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  className={`ob-chip${role === r ? ' is-on' : ''}`}
                  onClick={() => setRole(role === r ? '' : r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="ob-row">
              <button type="submit" className="ob-btn ob-btn--half" disabled={!role}>
                Continue
              </button>
              <button
                type="button"
                className="ob-btn ob-btn--half ob-btn--ghost"
                onClick={() => {
                  setRole('');
                  saveField('role', '');
                  go('year');
                }}
              >
                Skip this one
              </button>
            </div>
          </form>
        );

      case 'year':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Which year are you in?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Year">
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={year === y}
                  className={`ob-chip${year === y ? ' is-on' : ''}`}
                  onClick={() => {
                    setYear(y);
                    saveField('year', y);
                    go('daily');
                  }}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="ob-step">
            <h1 className="ob-question">How much time will you give it, honestly?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Daily time">
              {DAILY_TIME_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={dailyTime === d}
                  className={`ob-chip ob-chip--big${dailyTime === d ? ' is-on' : ''}`}
                  onClick={() => {
                    setDailyTime(d);
                    saveField('dailyTime', d);
                    go('window');
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="ob-hint">Small and steady beats large and imaginary.</p>
          </div>
        );

      case 'window': {
        const phoneCheck = cleanPhoneInput(phone);
        return (
          <div className="ob-step">
            <h1 className="ob-question">When in the day will you practice?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Practice time">
              {PRACTICE_TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={practiceTime === t}
                  className={`ob-chip${practiceTime === t ? ' is-on' : ''}`}
                  onClick={() => {
                    setPracticeTime(t);
                    saveField('practiceTime', t);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="ob-hint">Same time each day is the whole trick — your plan is built around this window.</p>

            <div className="ob-nudge">
              <label className="ob-nudge__label" htmlFor="ob-nudge-input">
                Want a nudge at that time? <span>(optional)</span>
              </label>
              <input
                id="ob-nudge-input"
                className="ob-input"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="WhatsApp number, e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError(false);
                }}
                maxLength={20}
              />
              <p className={`ob-hint${phoneError ? ' ob-hint--error' : ''}`}>
                {phoneError
                  ? 'That number looks short or long — check it, or leave it empty.'
                  : 'One short message a day at your window. Reply STOP to stop, anytime.'}
              </p>
            </div>

            <div className="ob-row">
              <button
                type="button"
                className="ob-btn ob-btn--half"
                disabled={!practiceTime}
                onClick={() => {
                  if (phone.trim() && !phoneCheck.valid) {
                    setPhoneError(true);
                    return;
                  }
                  saveField('phone', phoneCheck.cleaned);
                  go('target');
                }}
              >
                Continue
              </button>
              <button
                type="button"
                className="ob-btn ob-btn--half ob-btn--ghost"
                onClick={() => {
                  setPracticeTime('');
                  setPhone('');
                  saveField('practiceTime', '');
                  saveField('phone', '');
                  go('target');
                }}
              >
                Skip this one
              </button>
            </div>
          </div>
        );
      }

      case 'target':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              const days = daysFromToday(targetDate);
              if (targetDate && days !== null && days > 0) {
                saveField('targetDate', targetDate);
                go('level');
              }
            }}
          >
            <h1 className="ob-question">When&rsquo;s the date that matters?</h1>
            <p className="ob-sub">
              The day your preparation has to show results — placement season, a
              specific drive, or a goal of your own.
            </p>
            <div className="ob-chips" role="radiogroup" aria-label="Target date">
              {TARGET_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="radio"
                  aria-checked={targetMode === p.key}
                  className={`ob-chip${targetMode === p.key ? ' is-on' : ''}`}
                  onClick={() => {
                    setTargetMode(p.key);
                    if (!p.custom) setTargetDate(isoPlusMonths(p.months));
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {targetMode === 'custom' && (
              <input
                type="date"
                className="ob-input ob-input--date"
                aria-label="Target date"
                min={new Date().toISOString().slice(0, 10)}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            )}
            {targetNote && <p className="ob-hint">{targetNote}</p>}
            <button
              type="submit"
              className="ob-btn"
              disabled={!targetDate || (daysFromToday(targetDate) ?? 0) <= 0}
            >
              Continue
            </button>
          </form>
        );

      case 'level':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Where are you today, honestly?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Skill self-rating">
              {SELF_RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={selfRating === r}
                  className={`ob-chip ob-chip--big${selfRating === r ? ' is-on' : ''}`}
                  onClick={() => {
                    setSelfRating(r);
                    saveField('selfRating', r);
                    go('done');
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="ob-hint">No judgement — it only sets the level day 1 starts at.</p>
          </div>
        );

      default:
        return (
          <div className="ob-step">
            <h1 className="ob-question">You&rsquo;re all set{firstName ? `, ${firstName}` : ''}.</h1>
            <div className="ob-summary">
              {track && (
                <p>
                  <span>Track</span> {track}{role ? ` · ${role}` : ''}
                </p>
              )}
              {year && (
                <p>
                  <span>Year</span> {year}
                </p>
              )}
              {dailyTime && (
                <p>
                  <span>Daily</span> {dailyTime}
                </p>
              )}
              {practiceTime && (
                <p>
                  <span>Window</span> {practiceTime}
                </p>
              )}
              {phone.trim() && (
                <p>
                  <span>Nudge</span> WhatsApp at your window
                </p>
              )}
              {targetDate && (
                <p>
                  <span>Target</span> {targetNote || prettyDate(targetDate)}
                </p>
              )}
              {planPreview && (
                <div className="ob-planpreview" role="note">
                  <b>Your {planPreview.totalDays}-day plan is ready</b>
                  <p className="ob-planpreview__meta">
                    {planPreview.week1Theme} · 3 tasks a day · day 1 opens on your dashboard
                  </p>
                  <ul>
                    {planPreview.firstTasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {why.length > 0 && (
                <ul className="ob-why" aria-label="Why this plan">
                  {why.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
            <p className="ob-free">
              You start on the free plan — the daily drill is always included, and a few
              incidents a week. No card, no clock.
            </p>
            <p className={`ob-hint ${save === 'error' ? 'ob-hint--error' : 'ob-hint--ok'}`}>
              {save === 'saving' && 'Saving…'}
              {save === 'saved' && 'Saved ✓ — every answer stays yours to change.'}
              {save === 'error' && "Couldn't save — is the backend running? Your answers stay on this screen."}
            </p>
            <button
              type="button"
              className="ob-btn"
              onClick={() => {
                window.location.assign(hasToken ? '/app' : '/');
              }}
            >
              {hasToken ? 'Open my dashboard' : 'Back to home'}
            </button>
          </div>
        );
    }
  };

  return (
    <main className="ob-page" ref={shellRef}>
      <div className="ob-column">
        <header className="ob-topbar">
          <a className="ob-logo" href="/" aria-label="Quadly home"><Logo /></a>
        </header>

        <div className="ob-hero">
          <p className="ob-kicker">Your daily practice plan · Under 90 seconds</p>
          <h1 className="ob-hero-title">Eight questions. One plan.</h1>
          <p className="ob-hero-sub">
            Real, hands-on practice on your track — planned around the time you
            will actually sit down, and the date you are working toward.
          </p>
        </div>

        <section className="ob-card">
          <div className="ob-card-head">
            <span className="ob-card-step">{countLabel(step)}</span>
            <div className="ob-progress" aria-hidden="true">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <span key={i} className={`ob-progress__seg ${i <= fill ? 'is-filled' : ''}`}>
                  <span className="ob-progress__fill" />
                </span>
              ))}
            </div>
          </div>

          <div className="ob-card__body">
            {leaving && (
              <div className="ob-layer ob-layer--out" data-dir={leaving.dir} aria-hidden="true">
                {renderStep(leaving.step)}
              </div>
            )}
            <div className="ob-layer ob-layer--in" data-dir={leaving ? leaving.dir : 1} key={step}>
              {renderStep(step)}
            </div>
          </div>

          {step !== 'welcome' && step !== 'name' && step !== 'done' && (
            <button type="button" className="ob-back" onClick={back} disabled={Boolean(leaving)}>
              ‹ Back
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
