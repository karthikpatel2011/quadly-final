import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import './ambassador-page.css';
import Logo from '../Logo.jsx';

const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5-year integrated'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MESSAGE_MIN = 20;
const MESSAGE_MAX = 800;

const PERKS = [
  {
    title: 'Official title & certificate',
    body: 'Campus Lead on your resume, a signed certificate and the official Quadly Ambassador title for your college.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="9" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9.5 13.5 8 21l4-2.2L16 21l-1.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Early access',
    body: 'New features land on your screen first, plus a direct line to the founding team for what your campus needs.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M13 2.5 5 13.5h5.5L11 21.5l8-11h-5.5L13 2.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Recommendation letter',
    body: 'An official ambassador title and a signed certificate — and a letter that says exactly what you built on campus.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8.5h6M9 12h6M9 15.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TIERS = [
  {
    step: '01',
    name: 'Scout',
    threshold: '5 active friends',
    reward: 'Sprite skin for your Quadly avatar.',
  },
  {
    step: '02',
    name: 'Captain',
    threshold: '25 active friends',
    reward: 'Free Pro for your account, a certificate and the official Captain title.',
  },
  {
    step: '03',
    name: 'Campus Lead',
    threshold: '100 active friends',
    reward: 'Early access to new features and a recommendation letter.',
    lead: true,
  },
];

const DUTIES = [
  'Share your invite link in your class groups.',
  'Host one ~20-minute Catch-the-AI contest every month.',
  'Spend roughly 2 hours a week on the program.',
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function AmbassadorProgram() {
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');
  const [privacy, setPrivacy] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | done
  const [appId, setAppId] = useState('');

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;

    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const college = String(data.get('college') || '').trim();
    const handle = String(data.get('handle') || '').trim();
    const reach = String(data.get('reach') || '').trim();
    const why = message.trim();

    const next = {};
    if (name.length < 2) next.name = 'Please enter your full name.';
    if (!EMAIL_RE.test(email)) next.email = 'Enter a valid email address.';
    if (college.length < 3) next.college = 'Please enter your college name.';
    if (!YEARS.includes(year)) next.year = 'Select your year of study.';
    if (why.length < MESSAGE_MIN) next.message = `Tell us a bit more — at least ${MESSAGE_MIN} characters.`;
    if (!privacy) next.privacy = 'Consent to the Privacy Policy is required to submit.';

    setFormError('');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('submitting');
    try {
      const res = await apiFetch('/ambassadors/apply', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          college,
          year,
          handle,
          reach,
          message: why,
          consents: { privacy, updates },
        }),
      });
      setAppId(res.id);
      setStatus('done');
    } catch (err) {
      setStatus('idle');
      setFormError(err.message);
    }
  };

  return (
    <main className="amb-page">
      <span className="amb-glow" aria-hidden="true" />

      <div className="amb-container">
        <header className="amb-topbar">
          <a className="amb-topbar__logo" href="/" aria-label="Quadly home"><Logo /></a>
          <nav className="amb-topbar__nav" aria-label="Page sections">
            <button type="button" className="amb-toplink" onClick={() => scrollToId('perks')}>Perks</button>
            <button type="button" className="amb-toplink" onClick={() => scrollToId('tiers')}>Tiers</button>
            <button type="button" className="amb-toplink" onClick={() => scrollToId('apply')}>Apply</button>
          </nav>
        </header>

        {/* 1 — Hero */}
        <section className="amb-hero">
          <p className="amb-kicker amb-rise">Ambassador Program</p>
          <h1 className="amb-hero__title amb-rise amb-rise--1">Lead Quadly at&nbsp;your college.</h1>
          <p className="amb-hero__sub amb-rise amb-rise--2">
            You bring Quadly to your campus — about two hours a week, one short contest a month —
            and we back you with Pro access, an official title and a recommendation letter as your campus grows.
          </p>
          <div className="amb-hero__cta amb-rise amb-rise--3">
            <button type="button" className="amb-hero__apply" onClick={() => scrollToId('apply')}>
              Apply in 2 minutes ↓
            </button>
          </div>
        </section>

        {/* 2 — Perks */}
        <section className="amb-section" id="perks">
          <p className="amb-kicker">Why do it</p>
          <h2 className="amb-h2">What you get</h2>
          <div className="amb-perks">
            {PERKS.map((perk) => (
              <article className="amb-card amb-perk" key={perk.title}>
                <span className="amb-perk__icon">{perk.icon}</span>
                <h3 className="amb-perk__title">{perk.title}</h3>
                <p className="amb-perk__body">{perk.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 3 — Tiers */}
        <section className="amb-section" id="tiers">
          <p className="amb-kicker">The ladder</p>
          <h2 className="amb-h2">Grow through three tiers</h2>
          <p className="amb-section__sub">
            Tiers count active friends — classmates who actually use Quadly, not just signed up.
          </p>
          <div className="amb-tiers">
            {TIERS.map((tier) => (
              <article className={`amb-card amb-tier ${tier.lead ? 'amb-tier--lead' : ''}`} key={tier.name}>
                <div className="amb-tier__top">
                  <span className="amb-tier__step">{tier.step}</span>
                  <span className="amb-tier__threshold">{tier.threshold}</span>
                </div>
                <h3 className="amb-tier__name">{tier.name}</h3>
                <p className="amb-tier__reward">{tier.reward}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 4 — Responsibilities */}
        <section className="amb-section">
          <p className="amb-kicker">The commitment</p>
          <h2 className="amb-h2">What you actually do</h2>
          <div className="amb-card amb-duties">
            <ul className="amb-duties__list">
              {DUTIES.map((duty) => (
                <li key={duty}>
                  <svg className="amb-duty__check" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {duty}
                </li>
              ))}
            </ul>
          </div>
        </section>


        {/* 6 — Apply form */}
        <section className="amb-section amb-section--apply" id="apply">
          <p className="amb-kicker">Apply</p>
          <h2 className="amb-h2">Tell us about you</h2>

          <div className="amb-card amb-formcard">
            {status === 'done' ? (
              <div className="amb-success" role="status">
                <span className="amb-success__mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26">
                    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="amb-success__title">Application received</h3>
                <p className="amb-success__idline">
                  Your application id: <span className="amb-success__id">{appId}</span>
                </p>
                <p className="amb-success__note">We review every application within a few days.</p>
                <a className="amb-success__home" href="/">Back to home</a>
              </div>
            ) : (
              <form className="amb-form" onSubmit={onSubmit} onInput={() => setFormError('')} noValidate>
                <div className="amb-row">
                  <label className={`amb-field ${errors.name ? 'has-error' : ''}`}>
                    <span className="amb-label">Full name</span>
                    <input className="amb-input" name="name" type="text" placeholder="e.g. Ananya Rao" onInput={() => clearError('name')} />
                  </label>
                  <label className={`amb-field ${errors.email ? 'has-error' : ''}`}>
                    <span className="amb-label">Email</span>
                    <input className="amb-input" name="email" type="email" placeholder="you@college.edu" autoComplete="email" onInput={() => clearError('email')} />
                  </label>
                </div>

                <label className={`amb-field ${errors.college ? 'has-error' : ''}`}>
                  <span className="amb-label">College</span>
                  <input className="amb-input" name="college" type="text" placeholder="e.g. CBIT Hyderabad" onInput={() => clearError('college')} />
                </label>

                <fieldset className={`amb-field amb-years ${errors.year ? 'has-error' : ''}`}>
                  <legend className="amb-label">Year</legend>
                  <div className="amb-years__chips" role="radiogroup" aria-label="Year of study">
                    {YEARS.map((y) => (
                      <label className={`amb-year ${year === y ? 'is-on' : ''}`} key={y}>
                        <input
                          className="amb-year__native"
                          type="radio"
                          name="year"
                          value={y}
                          checked={year === y}
                          onChange={() => {
                            setYear(y);
                            clearError('year');
                          }}
                        />
                        {y}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="amb-row">
                  <label className="amb-field">
                    <span className="amb-label">GitHub handle <span className="amb-label__opt">(optional)</span></span>
                    <input className="amb-input" name="handle" type="text" placeholder="@yourhandle" onInput={() => clearError('handle')} />
                  </label>
                  <label className="amb-field">
                    <span className="amb-label">Audience you can reach — rough is fine</span>
                    <input className="amb-input" name="reach" type="text" placeholder="e.g. ~200 in class groups" onInput={() => clearError('reach')} />
                  </label>
                </div>

                <label className={`amb-field ${errors.message ? 'has-error' : ''}`}>
                  <span className="amb-label">Why you?</span>
                  <textarea
                    className="amb-input amb-textarea"
                    name="message"
                    rows="4"
                    maxLength={MESSAGE_MAX}
                    placeholder="Clubs you run, groups you can reach, what you'd try first…"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearError('message');
                    }}
                  />
                  <span className="amb-counter" aria-live="polite">
                    <span>{message.length}/{MESSAGE_MAX}</span>
                    <span className={message.length >= MESSAGE_MIN ? 'is-ok' : 'is-low'}>
                      minimum {MESSAGE_MIN} characters
                    </span>
                  </span>
                </label>

                <div className={`amb-consent ${errors.privacy ? 'has-error' : ''}`}>
                  <input
                    id="amb-consent-privacy"
                    type="checkbox"
                    checked={privacy}
                    onChange={(e) => {
                      setPrivacy(e.target.checked);
                      clearError('privacy');
                    }}
                  />
                  <p>
                    <label htmlFor="amb-consent-privacy">I have read the </label>
                    <a href="/privacy">Privacy Policy</a>
                    <label htmlFor="amb-consent-privacy">
                      {' '}and consent to Quadly processing my application data to evaluate this
                      application.
                    </label>
                  </p>
                </div>
                {errors.privacy ? <p className="amb-field__error">{errors.privacy}</p> : null}

                <div className="amb-consent">
                  <input
                    id="amb-consent-updates"
                    type="checkbox"
                    checked={updates}
                    onChange={(e) => setUpdates(e.target.checked)}
                  />
                  <p>
                    <label htmlFor="amb-consent-updates">Send me ambassador program updates by email.</label>
                  </p>
                </div>

                {formError ? <p className="amb-form__alert" role="alert">{formError}</p> : null}

                <button type="submit" className="amb-submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Submitting…' : 'Submit application'}
                </button>
              </form>
            )}
          </div>
        </section>

        <footer className="amb-footer">
          <a className="amb-footer__logo" href="/"><Logo /></a>
          <span>Lead it on your campus.</span>
        </footer>
      </div>
    </main>
  );
}
