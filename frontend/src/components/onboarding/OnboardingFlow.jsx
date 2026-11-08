import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { apiFetch } from '../../lib/api.js';
import './onboarding-flow.css';
import Logo from '../Logo.jsx';

/* Onboarding — three questions, one optional GitHub connect, under a minute.
   Composition: blue headline field on top, dark question card straddling the
   blue→black fall. Step motion is pure CSS (right→left pushes); GSAP only
   stages the first entrance. No LeetCode, nothing ranked. */

const ROLE_CHIPS = ['SDE', 'AI/ML Engineer', 'Data Analyst', 'Full-Stack', 'QA Engineer', 'Higher Studies'];

// The brief's option lists — mirrored 1:1 from backend/src/lib/personalize.js.
const INTEREST_OPTIONS = ['Frontend development', 'Backend development', 'Full-stack development', 'Artificial intelligence', 'Machine learning', 'Data science', 'Cybersecurity', 'Cloud engineering', 'DevOps / Platform engineering', 'Mobile development', 'Game development', 'Blockchain / Web3', 'UI/UX and product design', 'Open source', 'Research', 'Startups / entrepreneurship', 'Competitive programming / problem solving', 'Not sure yet'];
const GOAL_OPTIONS = ['Figure out what I want to pursue', 'Learn practical skills', 'Build real projects', 'Create a strong portfolio', 'Find project teammates', 'Find a mentor', 'Prepare for interviews', 'Find an internship', 'Find a job', 'Explore hackathons and opportunities', 'Start something of my own'];
const STAGE_OPTIONS = ['Exploring', 'Learning fundamentals', 'Building projects', 'Preparing for opportunities', 'Already working / interning'];
const TIME_OPTIONS = ['15 minutes a day', '30 minutes a day', 'Around 1 hour a day', 'A few hours each week', 'My schedule changes'];

// Connect step: only GitHub is real today; the others are honest setup states.
const PROVIDERS = [
  { key: 'github', name: 'GitHub', benefit: 'Public profile and the repositories you choose — project evidence for your portfolio.' },
  { key: 'calendar', name: 'Google Calendar', benefit: 'Interview schedules and mentoring sessions, if you connect it.' },
  { key: 'drive', name: 'Google Drive', benefit: 'Bring one resume or project doc — only files you pick.' },
  { key: 'email', name: 'Email', benefit: 'Spot internship and assessment mails — read narrowly, never sent on your behalf.' },
];
const AVATARS = Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, '0')); // pfp set: /avatars/NN.webp

const STEPS = ['name', 'college', 'target', 'interests', 'goals', 'stage', 'time', 'note', 'connect'];
const KICKERS = {
  name: 'Question 1 of 6',
  college: 'Question 2 of 6',
  target: 'Question 3 of 6',
  interests: 'Question 4 of 6',
  goals: 'Question 5 of 6',
  stage: 'Question 6 of 6',
  time: 'Preferences · 10 seconds',
  note: 'Optional · 10 seconds',
  connect: 'Optional · make Quadly more useful',
  done: 'All done',
};

const PREV_STEP = {
  name: 'welcome', college: 'name', target: 'college', interests: 'target',
  goals: 'interests', stage: 'goals', time: 'stage', note: 'time',
  connect: 'note', done: 'connect',
};

function countLabel(step) {
  if (step === 'welcome') return 'Welcome';
  if (step === 'time' || step === 'note') return 'Preferences';
  if (step === 'connect') return 'Optional';
  const i = STEPS.indexOf(step);
  if (i <= 2) return `Question ${i + 1} of 6`;
  if (i <= 6) return `Question ${i - 1} of 6`;
  return '';
}

export default function OnboardingFlow() {
  const [step, setStep] = useState('welcome');
  const [avatar, setAvatar] = useState('');            // '' = auto-assign at save
  const [leaving, setLeaving] = useState(null); // { step, dir }
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [amb, setAmb] = useState({ status: 'idle', match: null }); // idle|checking|found|none|offline
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [ghUser, setGhUser] = useState('');
  const [gh, setGh] = useState({ status: 'idle', info: null, msg: '' }); // idle|checking|connected|error
  const [interests, setInterests] = useState([]);
  const [goalsSel, setGoalsSel] = useState([]);
  const [stage, setStage] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');
  const [note, setNote] = useState('');
  const [save, setSave] = useState('idle'); // idle|saving|saved|error
  let hasToken = false;
  try {
    hasToken = Boolean(localStorage.getItem('quadly:token'));
  } catch {
    /* storage unavailable */
  }
  const [planPreview, setPlanPreview] = useState(null);
  const shellRef = useRef(null);
  const leaveTimer = useRef(null);

  // First-mount entrance (GSAP only here; every step swap is CSS).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.ob-column > *', { y: 16, opacity: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out' });
    }, shellRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

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

  // Debounced ambassador lookup while typing the college.
  useEffect(() => {
    if (step !== 'college') return undefined;
    const v = college.trim();
    if (v.length < 3) {
      setAmb({ status: 'idle', match: null });
      return undefined;
    }
    setAmb({ status: 'checking', match: null });
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch('/onboarding/ambassador-lookup', {
          method: 'POST',
          body: JSON.stringify({ college: v }),
        });
        setAmb(res.found ? { status: 'found', match: res.ambassador } : { status: 'none', match: null });
      } catch {
        setAmb({ status: 'offline', match: null });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [step, college]);

  async function connectGitHub() {
    const username = ghUser.trim();
    if (!username || gh.status === 'checking') return;
    setGh({ status: 'checking', info: null, msg: '' });
    try {
      const info = await apiFetch(`/onboarding/github?username=${encodeURIComponent(username)}`);
      setGh({ status: 'connected', info, msg: '' });
    } catch (err) {
      setGh({ status: 'error', info: null, msg: err.message });
    }
  }

  // Save once the final screen is reached.
  const savedRef = useRef(false);
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
      body: JSON.stringify({
        email,
        name: name.trim(),
        college: college.trim(),
        ambassador: amb.status === 'found' && amb.match ? amb.match : null,
        target: { company: company.trim(), role },
        github: gh.status === 'connected' && gh.info ? gh.info.login : null,
        avatar: avatar || null,
        interests,
        goals: goalsSel,
        stage,
        timeCommitment,
        note: note.trim(),
      }),
    })
      .then((res) => {
        setPlanPreview(res.plan ?? null);
        setSave('saved');
      })
      .catch(() => setSave('error'));
    return undefined;
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const fill = { welcome: 0, name: 0, college: 1, target: 2, interests: 3, goals: 3, stage: 4, time: 4, note: 5, connect: 5, done: 6 }[step];

  const renderStep = (s) => {
    switch (s) {
      case 'welcome':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Welcome to Quadly.</h1>
            <p className="ob-sub">
              Three quick questions — then a Placement Plan that fits your college, your year and
              the companies you&rsquo;re aiming at. Squads and streaks come included.
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
              if (name.trim().length >= 2) go('college');
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
            <p className="ob-hint">This is how your Coach and squad will greet you.</p>
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
              go('target');
            }}
          >
            <h1 className="ob-question">Which college are you from?</h1>
            <input
              className="ob-input"
              aria-label="Your college"
              placeholder="Start typing your college"
              autoFocus
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              maxLength={80}
            />
            {amb.status === 'checking' && <p className="ob-hint">Checking for your campus ambassador…</p>}
            {amb.status === 'offline' && <p className="ob-hint">Ambassador check is offline right now — you can still continue.</p>}
            {amb.status === 'none' && (
              <p className="ob-hint">
                {college.trim().length >= 3
                  ? 'No ambassador linked there yet — your cohort would be the first.'
                  : 'Keep typing — we need a little more of the name.'}
              </p>
            )}
            {amb.status === 'found' && amb.match && (
              <>
                <div className="ob-amb-card" role="group" aria-label="Ambassador found">
                  <span className="ob-amb-avatar">{amb.match.name.slice(0, 1)}</span>
                  <span className="ob-amb-meta">
                    <strong>{amb.match.name}</strong>
                    <span>{amb.match.college} · Campus Ambassador</span>
                  </span>
                </div>
                <p className="ob-ask">Is this your ambassador?</p>
                <div className="ob-row">
                  <button type="button" className="ob-btn ob-btn--half" onClick={() => go('target')}>
                    Yes, that&rsquo;s them
                  </button>
                  <button
                    type="button"
                    className="ob-btn ob-btn--half ob-btn--ghost"
                    onClick={() => setAmb({ status: 'none', match: null })}
                  >
                    Not them
                  </button>
                </div>
              </>
            )}
            <button type="submit" className="ob-btn" disabled={college.trim().length < 3}>
              Continue
            </button>
          </form>
        );

      case 'target':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              go('github');
            }}
          >
            <h1 className="ob-question">Where are you headed?</h1>
            <input
              className="ob-input"
              aria-label="Target company"
              placeholder="Target company — e.g. Google"
              autoFocus
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={60}
            />
            <div className="ob-chips" role="radiogroup" aria-label="Target role">
              {ROLE_CHIPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  className={`ob-chip ${role === r ? 'is-on' : ''}`}
                  onClick={() => setRole(role === r ? '' : r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="ob-hint">Pick the closest — you can change it anytime.</p>
            <button type="submit" className="ob-btn">
              Continue
            </button>
          </form>
        );

      case 'interests':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Which areas of computer science interest you?</h1>
            <div className="ob-chips" role="group" aria-label="Interests">
              {INTEREST_OPTIONS.map((o) => (
                <button key={o} type="button" aria-pressed={interests.includes(o)} className={`ob-chip ${interests.includes(o) ? 'is-on' : ''}`} onClick={() => setInterests((v) => (v.includes(o) ? v.filter((x) => x !== o) : [...v, o].slice(0, 6)))}>
                  {o}
                </button>
              ))}
            </div>
            <p className="ob-hint">Pick up to six. “Not sure yet” is a real answer — Quadly will help you explore.</p>
            <button type="button" className="ob-btn" onClick={() => go('goals')}>Continue</button>
          </div>
        );

      case 'goals':
        return (
          <div className="ob-step">
            <h1 className="ob-question">What are you trying to achieve right now?</h1>
            <div className="ob-chips" role="group" aria-label="Goals">
              {GOAL_OPTIONS.map((o) => (
                <button key={o} type="button" aria-pressed={goalsSel.includes(o)} className={`ob-chip ${goalsSel.includes(o) ? 'is-on' : ''}`} onClick={() => setGoalsSel((v) => (v.includes(o) ? v.filter((x) => x !== o) : [...v, o].slice(0, 6)))}>
                  {o}
                </button>
              ))}
            </div>
            <p className="ob-hint">As many as apply — goals change, and so will your plan.</p>
            <button type="button" className="ob-btn" onClick={() => go('stage')}>Continue</button>
          </div>
        );

      case 'stage':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Where are you right now?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Current stage">
              {STAGE_OPTIONS.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={stage === o} className={`ob-chip ${stage === o ? 'is-on' : ''}`} onClick={() => setStage(o)}>
                  {o}
                </button>
              ))}
            </div>
            <p className="ob-hint">A self-description, not a judgement.</p>
            <button type="button" className="ob-btn" disabled={!stage} onClick={() => go('time')}>Continue</button>
          </div>
        );

      case 'time':
        return (
          <div className="ob-step">
            <h1 className="ob-question">How much time do you realistically have?</h1>
            <div className="ob-chips" role="radiogroup" aria-label="Time commitment">
              {TIME_OPTIONS.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={timeCommitment === o} className={`ob-chip ${timeCommitment === o ? 'is-on' : ''}`} onClick={() => setTimeCommitment(o)}>
                  {o}
                </button>
              ))}
            </div>
            <p className="ob-hint">Small and steady beats large and imaginary.</p>
            <button type="button" className="ob-btn" disabled={!timeCommitment} onClick={() => go('note')}>Continue</button>
          </div>
        );

      case 'note':
        return (
          <form
            className="ob-step"
            onSubmit={(e) => {
              e.preventDefault();
              go('connect');
            }}
          >
            <h1 className="ob-question">Anything else Quadly should know?</h1>
            <textarea
              className="ob-input ob-textarea"
              aria-label="Anything else"
              placeholder={'e.g. “I know basic Python but don’t know what to build”'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <p className="ob-hint">No passwords, private keys, or sensitive personal data — this field is stored with your profile.</p>
            <button type="submit" className="ob-btn">Continue</button>
          </form>
        );

      case 'connect':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Make Quadly more useful</h1>
            <p className="ob-sub">Optional connections. Skip them — nothing on the dashboard is blocked.</p>
            <p className="ob-avatar-label">Pick your avatar — shows next to your name</p>
            <div className="ob-avatars" role="radiogroup" aria-label="Choose a profile picture">
              {AVATARS.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={avatar === a}
                  className={`ob-avatar-btn${avatar === a ? ' is-on' : ''}`}
                  onClick={() => setAvatar(avatar === a ? '' : a)}
                >
                  <img src={`/avatars/${a}.webp`} alt={`Avatar option ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="ob-providers">
              {PROVIDERS.map((p) => (
                <div className="ob-provider" key={p.key} data-provider={p.key}>
                  <div className="ob-provider__meta">
                    <b>{p.name}</b>
                    <span>{p.benefit}</span>
                  </div>
                  {p.key === 'github' ? (
                    gh.status === 'connected' ? (
                      <span className="ob-provider__state is-on">Connected ✓</span>
                    ) : (
                      <span className="ob-provider__state">Username below ↓</span>
                    )
                  ) : (
                    <span className="ob-provider__state">Needs app setup</span>
                  )}
                </div>
              ))}
            </div>
            <p className="ob-hint">
              GitHub connects your public profile only. Calendar, Drive and email turn on after the OAuth apps are
              approved — nothing here pretends to be connected.
            </p>
            <div className="ob-row">
              <input
                className="ob-input ob-input--row"
                aria-label="GitHub username"
                placeholder="GitHub username"
                value={ghUser}
                disabled={gh.status === 'connected'}
                onChange={(e) => setGhUser(e.target.value)}
                maxLength={39}
              />
              {gh.status === 'connected' ? (
                <button type="button" className="ob-btn ob-btn--row" onClick={() => go('done')}>
                  Continue
                </button>
              ) : (
                <button type="button" className="ob-btn ob-btn--row" onClick={connectGitHub} disabled={gh.status === 'checking' || ghUser.trim().length < 2}>
                  {gh.status === 'checking' ? <span className="ob-dots"><i /><i /><i /></span> : 'Connect GitHub'}
                </button>
              )}
            </div>
            {gh.status === 'connected' && gh.info && (
              <div className="ob-gh-card">
                <img className="ob-gh-avatar" src={gh.info.avatarUrl} alt={`${gh.info.login} avatar`} width="52" height="52" />
                <span className="ob-gh-meta">
                  <strong>{gh.info.name || gh.info.login}</strong>
                  <span>
                    @{gh.info.login} · {gh.info.publicRepos} public repos
                  </span>
                </span>
                <span className="ob-gh-check">Connected ✓</span>
              </div>
            )}
            {gh.status === 'error' && <p className="ob-hint ob-hint--error">{gh.msg}</p>}
            <button type="button" className="ob-linkish" onClick={() => go('done')}>
              Skip for now
            </button>
          </div>
        );

      case 'github-unused':
        return (
          <div className="ob-step">
            <h1 className="ob-question">Show your work</h1>
            <p className="ob-sub">
              Connect GitHub — public profile only. What you practice stays yours; nothing here is ever ranked.
            </p>
            <p className="ob-avatar-label">Pick your avatar — shows next to your name</p>
            <div className="ob-avatars" role="radiogroup" aria-label="Choose a profile picture">
              {AVATARS.map((a, i) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={avatar === a}
                  className={`ob-avatar-btn${avatar === a ? ' is-on' : ''}`}
                  onClick={() => setAvatar(avatar === a ? '' : a)}
                >
                  <img src={`/avatars/${a}.webp`} alt={`Avatar option ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="ob-row">
              <input
                className="ob-input ob-input--row"
                aria-label="GitHub username"
                placeholder="GitHub username"
                value={ghUser}
                disabled={gh.status === 'connected'}
                onChange={(e) => setGhUser(e.target.value)}
                maxLength={39}
              />
              {gh.status === 'connected' ? (
                <button type="button" className="ob-btn ob-btn--row" onClick={() => go('done')}>
                  Continue
                </button>
              ) : (
                <button type="button" className="ob-btn ob-btn--row" onClick={connectGitHub} disabled={gh.status === 'checking' || ghUser.trim().length < 2}>
                  {gh.status === 'checking' ? <span className="ob-dots"><i /><i /><i /></span> : 'Connect'}
                </button>
              )}
            </div>
            {gh.status === 'connected' && gh.info && (
              <div className="ob-gh-card">
                <img className="ob-gh-avatar" src={gh.info.avatarUrl} alt={`${gh.info.login} avatar`} width="52" height="52" />
                <span className="ob-gh-meta">
                  <strong>{gh.info.name || gh.info.login}</strong>
                  <span>
                    @{gh.info.login} · {gh.info.publicRepos} public repos · {gh.info.followers} followers
                  </span>
                </span>
                <span className="ob-gh-check">Connected ✓</span>
              </div>
            )}
            {gh.status === 'error' && <p className="ob-hint ob-hint--error">{gh.msg}</p>}
            {gh.status !== 'connected' && (
              <button type="button" className="ob-linkish" onClick={() => go('done')}>
                Skip for now
              </button>
            )}
          </div>
        );

      default: {
        const firstName = name.trim().split(' ')[0];
        return (
          <div className="ob-step">
            <h1 className="ob-question">You&rsquo;re all set{firstName ? `, ${firstName}` : ''}.</h1>
            <div className="ob-summary">
              {college.trim() && (
                <p>
                  <span>College</span> {college.trim()}
                </p>
              )}
              {amb.status === 'found' && amb.match && (
                <p>
                  <span>Ambassador</span> {amb.match.name} — linked when profiles ship
                </p>
              )}
              {(company.trim() || role) && (
                <p>
                  <span>Target</span> {[company.trim(), role].filter(Boolean).join(' · ')}
                </p>
              )}
              {interests.length > 0 && (
                <p>
                  <span>Interests</span> {interests.join(', ')}
                </p>
              )}
              {stage && (
                <p>
                  <span>Stage</span> {stage} · {timeCommitment}
                </p>
              )}
              {gh.status === 'connected' && gh.info && (
                <p>
                  <span>GitHub</span> @{gh.info.login}
                </p>
              )}
              {planPreview && (
                <div className="ob-planpreview" role="note">
                  <b>Your 90-day plan is ready</b>
                  <p className="ob-planpreview__meta">
                    {planPreview.week1Theme} · 3 tasks a day · {planPreview.totalDays} days
                  </p>
                  <ul>
                    {planPreview.firstTasks.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <p className={`ob-hint ${save === 'error' ? 'ob-hint--error' : 'ob-hint--ok'}`}>
              {save === 'saving' && 'Saving…'}
              {save === 'saved' && 'Saved ✓ — your Coach picks up from here.'}
              {save === 'error' && "Couldn't save — is the backend running? Your answers stay on this screen."}
            </p>
            <button
              type="button"
              className="ob-btn"
              onClick={() => {
                let token = null;
                try {
                  token = localStorage.getItem('quadly:token');
                } catch {
                  /* storage unavailable */
                }
                window.location.assign(token ? '/app' : '/');
              }}
            >
              {hasToken ? 'Open my dashboard' : 'Back to home'}
            </button>
          </div>
        );
      }
    }
  };

  return (
    <main className="ob-page" ref={shellRef}>
      <div className="ob-column">
        <header className="ob-topbar">
          <a className="ob-logo" href="/" aria-label="Quadly home"><Logo /></a>
        </header>

        <div className="ob-hero">
          <p className="ob-kicker">Set up your profile · Under a minute</p>
          <h1 className="ob-hero-title">Six questions. One plan.</h1>
          <p className="ob-hero-sub">
            Tell us where you&rsquo;re headed — your Placement Plan, squads and streaks shape
            themselves around it.
          </p>
        </div>

        <section className="ob-card">
          <div className="ob-card-head">
            <span className="ob-card-step">{countLabel(step)}</span>
            <div className="ob-progress" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`ob-progress__seg ${i < fill ? 'is-filled' : ''}`}>
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

          {step !== 'name' && step !== 'welcome' && step !== 'done' && (
            <button type="button" className="ob-back" onClick={back} disabled={Boolean(leaving)}>
              ‹ Back
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
