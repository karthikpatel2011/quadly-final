import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { apiFetch } from '../../lib/api.js';
import './join-page.css';
import Logo from '../Logo.jsx';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const QUOTES = [
  { text: 'You do not need a brand-name college. You need ninety honest days.', by: 'Quadly Coach' },
  { text: 'Small daily tasks beat all-night sprints — consistency is the shortcut.', by: 'Quadly Coach' },
  { text: 'Run AI before it runs you — judge every answer it hands you.', by: 'Quadly Coach' },
];

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
      <path
        className="join-eye__open"
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path className="join-eye__slash" d="M4.5 19.5L19.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function JoinPage() {
  const [mode, setMode] = useState('signup'); // 'signup' (Try Now) | 'login'
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [msg, setMsg] = useState('');
  const [errField, setErrField] = useState(null);
  const [quote, setQuote] = useState(0);
  const [leavingQuote, setLeavingQuote] = useState(null);
  const quoteRef = useRef(0);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  // Entrance timeline for the left panel only — the quote panel is CSS-only.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.join-card', { y: 36, scale: 0.97, opacity: 0, duration: 0.8 })
        .from('.join-left > .join-fade', { y: 18, opacity: 0, stagger: 0.07, duration: 0.55 }, 0.4);
    }, cardRef);

    return () => ctx.revert();
  }, []);

  // Rotating quote — exits left, new one slides in from the right (CSS only).
  useEffect(() => {
    const timer = setInterval(() => {
      setLeavingQuote(quoteRef.current);
      const next = (quoteRef.current + 1) % QUOTES.length;
      quoteRef.current = next;
      setQuote(next);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Drop the exiting slide once its exit animation has played.
  useEffect(() => {
    if (leavingQuote === null) return undefined;
    const t = setTimeout(() => setLeavingQuote(null), 700);
    return () => clearTimeout(t);
  }, [leavingQuote]);

  const switchMode = (next) => {
    if (next === mode || status === 'loading') return;
    setStatus('idle');
    setMsg('');
    setErrField(null);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !formRef.current) {
      setMode(next);
      return;
    }
    gsap.to(formRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        setMode(next);
        gsap.fromTo(formRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' });
      },
    });
  };

  const forgot = () => {
    setStatus('idle');
    setMsg('Password reset arrives with the beta — register now and your spot is saved.');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading' || status === 'done') return;

    const data = new FormData(e.currentTarget);
    const password = String(data.get('password') || '');

    if (mode === 'signup') {
      const email = String(data.get('email') || '').trim();
      const confirm = String(data.get('confirm') || '');

      if (!EMAIL_RE.test(email)) {
        setErrField('email');
        setStatus('error');
        setMsg('Enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrField('password');
        setStatus('error');
        setMsg('Password needs at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setErrField('confirm');
        setStatus('error');
        setMsg('Passwords do not match.');
        return;
      }

      setStatus('loading');
      try {
        const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, confirm }) });
        try {
          localStorage.setItem('quadly:token', res.token);
          localStorage.setItem('quadly:email', res.email);
        } catch {
          /* storage unavailable */
        }
        setStatus('done');
        setMsg('Account created — welcome, ' + res.email + '. Now let\u2019s set you up.');
        setTimeout(() => window.location.assign('/onboarding'), 900);
      } catch (err) {
        setStatus('error');
        setMsg(err.message);
        // The email exists (maybe from an earlier session): drop the user on
        // the login form instead of leaving them in the register flow.
        if (/already registered/i.test(err.message)) {
          switchMode('login');
          setMsg('That email is registered — enter your password and log in.');
        }
      }
      return;
    }

    const email = String(data.get('email') || '').trim();
    if (!EMAIL_RE.test(email)) {
      setErrField('email');
      setStatus('error');
      setMsg('Enter the email you registered with.');
      return;
    }
    if (password.length < 6) {
      setErrField('password');
      setStatus('error');
      setMsg('Password needs at least 6 characters.');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      try {
        localStorage.setItem('quadly:token', res.token);
        localStorage.setItem('quadly:email', res.email);
      } catch {
        /* storage unavailable */
      }
      setStatus('done');
      if (res.onboarded) {
        setMsg('Welcome back, ' + res.email + '. Opening your dashboard…');
        setTimeout(() => window.location.assign('/app'), 700);
      } else {
        setMsg('Welcome back \u2014 let\u2019s finish your setup.');
        setTimeout(() => window.location.assign('/onboarding'), 900);
      }
    } catch (err) {
      setStatus('error');
      setMsg(err.message);
    }
  };

  return (
    <main className="join-page" ref={cardRef}>
      <div className="join-card">
        <section className="join-left">
          <header className="join-topbar join-fade">
            <a className="join-logo" href="/" aria-label="Quadly home"><Logo /></a>
          </header>

          <div className="join-form-area" ref={formRef}>
            <div className="join-seg join-fade" data-mode={mode} role="tablist" aria-label="Choose a mode">
              <span className="join-seg__thumb" aria-hidden="true" />
              <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'is-on' : ''} onClick={() => switchMode('login')}>
                Log in
              </button>
              <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'is-on' : ''} onClick={() => switchMode('signup')}>
                Try Now
              </button>
            </div>

            <h1 className="join-fade">{mode === 'signup' ? 'Get placement-ready' : 'Welcome back'}</h1>
            <p className="join-sub join-fade">
              {mode === 'signup'
                ? 'Create your account to start the free 90-day plan — daily tasks, squads and streaks included.'
                : 'Log in to continue to Quadly.'}
            </p>

            <form className="join-fields join-fade" onSubmit={onSubmit} onInput={() => setErrField(null)} noValidate>
              <label className={`join-field ${errField === 'email' ? 'has-error' : ''}`}>
                <span className="join-label">Email</span>
                <input name="email" type="email" placeholder="Your email address" autoComplete="email" />
              </label>

              <label className={`join-field ${errField === 'password' ? 'has-error' : ''}`}>
                <span className="join-label-row">
                  <span className="join-label">Password</span>
                  {mode === 'login' && (
                    <button type="button" className="join-link" onClick={forgot}>Forgot password?</button>
                  )}
                </span>
                <span className="join-input-wrap">
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className={`join-eye ${showPw ? 'is-off' : ''}`}
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon />
                  </button>
                </span>
              </label>

              {mode === 'signup' && (
                <label className={`join-field ${errField === 'confirm' ? 'has-error' : ''}`}>
                  <span className="join-label">Confirm password</span>
                  <input
                    name="confirm"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </label>
              )}

              <button type="submit" className={`join-btn ${status === 'done' ? 'is-done' : ''}`} disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <span className="join-dots" aria-label="Submitting"><i /><i /><i /></span>
                ) : status === 'done' ? (
                  <>
                    <svg className="join-check" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                    You&rsquo;re in
                  </>
                ) : (mode === 'signup' ? 'Try Now' : 'Log in')}
              </button>

              {msg ? <p key={msg} className={`join-status join-status--${status}`} role="status">{msg}</p> : null}
              {status === 'done' && mode === 'signup' && (
                <a className="join-next" href="/onboarding">
                  Continue to setup →
                </a>
              )}
            </form>
          </div>

          <p className="join-alt join-fade">
            {mode === 'signup' ? (
              <>Already have an account? <button type="button" className="join-link" onClick={() => switchMode('login')}>Log in</button></>
            ) : (
              <>Don&rsquo;t have an account? <button type="button" className="join-link" onClick={() => switchMode('signup')}>Try Now</button></>
            )}
          </p>
        </section>

        <aside className="join-right">
          <span className="join-right__streak join-right__streak--a" aria-hidden="true" />
          <span className="join-right__streak join-right__streak--b" aria-hidden="true" />

          <figure className="join-quote">
            <span className="join-quote__mark" aria-hidden="true">&ldquo;</span>
            <div className="join-quote__viewport">
              {leavingQuote !== null && (
                <div className="join-quote__slide join-quote__slide--out" key={`out-${leavingQuote}`} aria-hidden="true">
                  <blockquote>{QUOTES[leavingQuote].text}</blockquote>
                  <figcaption>— {QUOTES[leavingQuote].by}</figcaption>
                </div>
              )}
              <div className="join-quote__slide join-quote__slide--in" key={`in-${quote}`}>
                <blockquote>{QUOTES[quote].text}</blockquote>
                <figcaption>— {QUOTES[quote].by}</figcaption>
              </div>
            </div>
          </figure>
        </aside>
      </div>
    </main>
  );
}
