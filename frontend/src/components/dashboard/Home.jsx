import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import { Icon } from './icons.jsx';
import gotoRoute from './nav.js';

// Home V1 — the single-student feed of real cards, in the PRD's order:
// today's plan first (greeting, streak, progress), then the day's drill,
// private wins from verified results, the squad, and the caught-up end.
// Anything without a real payload is not rendered — no filler cards, no
// sample data, no college information (the profile owns that).

function authHeaders() {
  let token = null;
  try {
    token = localStorage.getItem('quadly:token');
  } catch {
    /* storage unavailable */
  }
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` };
}

function helloFor(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Up late';
}

// Category → the workspace where the task is actually done. Categories with
// no built home yet (ship, apply) render as plain text — never a dead link.
const MISSION_DEST = {
  learn: '/app/practice',
  interview: '/app/interviews',
  network: '/app/squad',
};

function MissionRow({ mission }) {
  const dest = MISSION_DEST[mission.category];
  const body = (
    <>
      <span className="qd-task__topic">{mission.categoryLabel}</span>
      <span className="qd-task__body">
        <span className="qd-task__title">{mission.title}</span>
        <span className="qd-task__meta">
          {[mission.detail, mission.minutes ? `${mission.minutes} min` : ''].filter(Boolean).join(' · ')}
        </span>
        {mission.done && (
          <span className="qd-task__result">
            <Icon name="check" size={12} /> {mission.result || 'Done — verified'}
          </span>
        )}
      </span>
    </>
  );
  return (
    <li className={`qd-task${mission.done ? ' is-done' : ''}`}>
      {dest ? (
        <button type="button" className="qd-task__go" onClick={() => gotoRoute(dest)} title={mission.title}>
          {body}
        </button>
      ) : (
        <div className="qd-task__go qd-task__go--flat">{body}</div>
      )}
    </li>
  );
}

export default function Home() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [data, setData] = useState(null);
  const [wp, setWp] = useState(null); // GET /workplace/today — null = not started
  const ctrlRef = useRef(null);

  const load = useCallback(() => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
    setPhase('loading');
    Promise.all([
      apiFetch('/home', { headers: authHeaders(), signal: ctrl.signal }),
      apiFetch('/workplace/today', { headers: authHeaders(), signal: ctrl.signal }).catch(() => null),
    ])
      .then(([home, workplace]) => {
        if (ctrl.signal.aborted) return;
        setData(home);
        setWp(workplace);
        setPhase('ready');
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err.name === 'AbortError') return;
        if (err.message.includes('401') || /Not signed in/i.test(err.message)) {
          window.location.assign('/join');
          return;
        }
        setPhase('error');
      });
  }, []);

  useEffect(() => {
    load();
    return () => ctrlRef.current?.abort();
  }, [load]);

  if (phase === 'error') {
    return (
      <main className="qd-h">
        <div className="qd-center" role="alert">
          <h2 className="qd-h2">Couldn’t load your home feed</h2>
          <p className="qd-muted">Check your connection and try again.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (phase === 'loading') {
    return (
      <main className="qd-h" aria-busy="true" aria-label="Home">
        <div className="qd-fl">
          <div className="skeleton qd-fl-b" style={{ height: 260 }} />
          <div className="qd-fl-c qd-rail">
            <div className="skeleton" style={{ height: 150 }} />
            <div className="skeleton" style={{ height: 130 }} />
          </div>
        </div>
      </main>
    );
  }

  const today = data?.today;
  const t = today?.status === 'ok' ? today.data : null;
  const challenge = data?.challenge?.status === 'ok' ? data.challenge.data : null;
  const wins = data?.wins?.status === 'ok' ? data.wins.data.items : [];
  const squad = data?.squad?.status === 'ok' ? data.squad.data : null;
  const next = data?.caughtUp?.status === 'ok' ? data.caughtUp.data.next : null;

  const firstName = t?.name ? t.name.split(' ')[0] : '';
  const missions = t?.missions || [];
  const allDone = t && t.total > 0 && t.doneCount === t.total;
  const dayPct = t?.plan ? Math.min(100, Math.round(((t.plan.dayNumber || 1) / (t.plan.totalDays || 90)) * 100)) : 0;
  const squadInfo = squad?.squad || null;
  const squadDone = squadInfo ? squadInfo.members.filter((m) => m.doneToday).length : 0;

  return (
    <main className="qd-h" aria-label="Home">
      <section className="qd-greet">
        <div className="qd-avatar qd-avatar--lg" aria-hidden="true">
          {(t?.name || '?').trim().charAt(0).toUpperCase()}
        </div>
        <div className="qd-greet__text">
          <p className="qd-greet__clock">{data?.label || ''}</p>
          <h1 className="qd-greet__hello">
            {firstName ? `${helloFor(new Date().getHours())}, ${firstName}.` : 'Welcome back.'}
          </h1>
          <div className="qd-pills">
            {t && t.streak > 0 && <span className="qd-pill qd-pill--streak">{t.streak}-day streak</span>}
            {t && t.streak === 0 && <span className="qd-pill">Finish one task to start the streak</span>}
            {t && t.total > 0 && <span className="qd-pill">{t.doneCount} of {t.total} done</span>}
            {t && t.minutesLeft > 0 && <span className="qd-pill">{t.minutesLeft} min left</span>}
          </div>
        </div>
      </section>

      <div className="qd-fl">
        {/* Today at work — the simulation is the core; the card leads the feed
            with the manager's message and one CTA. Hidden when it isn't real. */}
        {wp?.progress && wp.today && (
          <section className="qd-card qd-fl-a" aria-label="Today at work">
            <div className="qd-card__head">
              <h2 className="qd-card__title">Today at work — {wp.story?.company}</h2>
              <span className="qd-badge">Week {wp.today.weekOf.week} of {wp.today.weekOf.of} · ~{wp.today.minutes} min</span>
            </div>
            <p className="qd-front__text">
              <b>{wp.today.personaName}:</b> {wp.today.managerLine}
            </p>
            <p className="qd-front__author">{wp.today.weekday} · {wp.today.title} · job simulation, not work experience</p>
            <div className="qd-caught__actions">
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/workplace')}>
                Open Workplace
              </button>
            </div>
          </section>
        )}
        {wp?.progress === null && (
          <section className="qd-card qd-fl-a" aria-label="Start your job simulation">
            <div className="qd-card__head">
              <h2 className="qd-card__title">Your job simulation is waiting</h2>
              <span className="qd-badge">Week 1 free</span>
            </div>
            <p className="qd-front__text">
              Two weeks at a fictional company — a lesson, a ticket, a spoken defend, a verified
              scorecard. Training, clearly labelled; never sold as work experience.
            </p>
            <div className="qd-caught__actions">
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/workplace')}>
                Start at the Workplace
              </button>
            </div>
          </section>
        )}

        <section className="qd-card qd-fl-b" aria-label="Today’s plan">
          <div className="qd-card__head">
            <h2 className="qd-card__title">Today</h2>
            {t?.plan && <span className="qd-badge">{t.plan.theme}</span>}
          </div>

          {t && !t.hasPlan ? (
            <div className="qd-empty">
              <p className="qd-empty__title">Your plan is eight questions away.</p>
              <p className="qd-muted">
                One pass, about ninety seconds — a daily plan built around your time,
                your window, and the date that matters.
              </p>
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => window.location.assign('/onboarding')}>
                Build my plan
              </button>
            </div>
          ) : (
            <>
              <ul className="qd-tasklist">
                {missions.map((m) => (
                  <MissionRow key={m.id} mission={m} />
                ))}
              </ul>
              {t && t.total > 0 && (
                <p className={`qd-tasks__state${allDone ? ' qd-tasks__state--done' : ''}`}>
                  {allDone
                    ? 'All done for today — the streak is kept by finished work.'
                    : `${t.minutesLeft} minutes of honest work left today.`}
                </p>
              )}
              {t?.plan && (
                <div className="qd-planmeter">
                  <div className="qd-planmeter__track">
                    <div className="qd-planmeter__fill" style={{ width: `${dayPct}%` }} />
                  </div>
                  <small>
                    Day {t.plan.dayNumber} of {t.plan.totalDays} · Week {t.plan.weekNumber} — {t.plan.theme}
                  </small>
                </div>
              )}
            </>
          )}
        </section>

        <div className="qd-fl-c qd-rail">
          {challenge && (
            <section className="qd-card" aria-label="Today’s drill">
              <div className="qd-card__head">
                <h2 className="qd-card__title">Today’s drill</h2>
                <span className="qd-badge">5 min</span>
              </div>
              <p className="qd-front__title">{challenge.title}</p>
              <p className="qd-front__text">
                {challenge.answered
                  ? challenge.takeaway || 'Played — today’s answer key is open in practice.'
                  : 'Five minutes from real incidents. The daily habit is never paywalled.'}
              </p>
              {challenge.playedAtCollege > 0 && (
                <p className="qd-front__author">{challenge.playedAtCollege} at your college played today.</p>
              )}
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice/drill')}>
                {challenge.answered ? 'Review today’s drill' : 'Play today’s drill'}
              </button>
            </section>
          )}

          {wins.length > 0 && (
            <section className="qd-card" aria-label="Private wins">
              <div className="qd-card__head">
                <h2 className="qd-card__title">Private wins</h2>
              </div>
              <ul className="qd-wins">
                {wins.map((w) => (
                  <li key={w.id}>
                    <span className="qd-wins__check">
                      <Icon name="check" size={14} />
                    </span>
                    {w.text}
                  </li>
                ))}
              </ul>
              <p className="qd-front__author">From your verified results — only you see these.</p>
            </section>
          )}

          {squad &&
            (squadInfo ? (
              <section className="qd-card" aria-label="Your squad">
                <div className="qd-card__head">
                  <h2 className="qd-card__title">{squadInfo.name}</h2>
                  <span className="qd-badge">
                    {squadDone} of {squadInfo.members.length} done
                  </span>
                </div>
                <p className="qd-front__text">
                  {squadInfo.members.length > 0 && squadDone === squadInfo.members.length
                    ? 'Full squad done today — that is how streaks survive.'
                    : 'One nudge, politely capped, keeps the squad honest.'}
                </p>
                <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/squad')}>
                  Open your squad
                </button>
              </section>
            ) : (
              <section className="qd-card" aria-label="Study squads">
                <div className="qd-card__head">
                  <h2 className="qd-card__title">Study squads</h2>
                </div>
                <p className="qd-front__text">
                  Two to five friends keeping each other on track — a shared streak, gentle
                  nudges, quiet hours respected.
                </p>
                <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/squad')}>
                  Create or join
                </button>
              </section>
            ))}
        </div>

        <section className="qd-caught qd-fl-d" aria-label="Caught up">
          <h2 className="qd-caught__title">You’re caught up.</h2>
          <p className="qd-muted">
            {next
              ? `Next up: ${next.label} — ${next.whenText}.`
              : 'The next thing lands tomorrow, with three new tasks.'}
          </p>
        </section>
      </div>
    </main>
  );
}
