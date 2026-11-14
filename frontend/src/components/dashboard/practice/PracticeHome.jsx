import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../workspace.css';
import './practice.css';

// Practice home — one page, one job: what do I do today? The drill leads,
// the next incident follows, the level path and the recent work tell the
// student where they stand. One primary action: start today's drill.

const LEVEL_PATH = {
  1: { name: 'First response', note: 'Alerts, dashboards, and asking what changed' },
  2: { name: 'Reading dashboards', note: 'Separating load from errors, one service at a time' },
  3: { name: 'Reading logs', note: 'Finding the line that names the failure' },
  4: { name: 'Correlating signals', note: 'Change lists, metrics, and timelines against each other' },
  5: { name: 'Under pressure', note: 'Noise, cascade, and a clock — no hints' },
};

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
  };
}

export const gotoRoute = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

export default function PracticeHome() {
  const [phase, setPhase] = useState('loading'); // loading | ready | error
  const [data, setData] = useState(null);

  const load = useCallback(() => {
    const ctrl = new AbortController();
    apiFetch('/practice/home', { headers: authHeaders(), signal: ctrl.signal })
      .then((res) => {
        if (ctrl.signal.aborted) return;
        setData(res);
        setPhase('ready');
      })
      .catch((err) => {
        if (ctrl.signal.aborted || err.name === 'AbortError') return;
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        setPhase('error');
      });
    return ctrl;
  }, []);

  useEffect(() => {
    const ctrl = load();
    return () => ctrl.abort();
  }, [load]);

  useEffect(() => { document.title = 'Quadly — Practice'; }, []);

  if (phase === 'loading') {
    return (
      <div className="qd-pr">
        <div className="qd-card skeleton" style={{ height: 150 }} />
        <div className="qd-pr-grid">
          <div className="qd-card skeleton" style={{ height: 220 }} />
          <div className="qd-card skeleton" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-pr">
        <div className="qd-p__err qd-card" role="alert">
          <h2 className="qd-h2">Practice didn’t load</h2>
          <p className="qd-muted">Check your connection and try again.</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={() => { setPhase('loading'); load(); }}>Retry</button>
        </div>
      </div>
    );
  }

  const { level, streak, drill, nextIncident, recent, catalog, entitlements } = data;
  const path = Object.entries(LEVEL_PATH);

  return (
    <div className="qd-pr">
      <header className="qd-pr-head">
        <div>
          <p className="qd-kicker">Incident practice</p>
          <h2 className="qd-h2">Learning by handling real failures.</h2>
          <p className="qd-muted">Play the on-call engineer in incidents modeled on public postmortems, keep a five-minute daily drill, and write down what you learn.</p>
        </div>
        <div className="qd-pr-level">
          <span className="qd-pill qd-pr-levelpill">{level.label}</span>
          <span className="qd-pr-leveltier">{level.tier} incidents</span>
        </div>
      </header>

      <div className="qd-pr-grid">
        <section className="qd-card qd-pr-today" aria-label="Today's drill">
          <div className="qd-pr-cardhead">
            <p className="qd-kicker">Today · about 5 minutes</p>
            {streak.streak > 0 && (
              <span className="qd-pill">{streak.streak}-day streak</span>
            )}
          </div>
          <h3 className="qd-pr-cardtitle">{drill.answered ? 'Today’s drill is done' : drill.moment.title}</h3>
          {drill.seasonName && <p className="qd-muted">Season: {drill.seasonName}</p>}
          {drill.answered ? (
            <>
              <p className="qd-pr-takeaway">{drill.result?.takeaway || 'Come back tomorrow for the next one.'}</p>
              <button type="button" className="qd-btn qd-btn--ghost" onClick={() => gotoRoute('/app/practice/drill')}>Read today’s answer again</button>
            </>
          ) : (
            <>
              <p className="qd-muted">One log, one chart, or one config — what went wrong, and what would you check next?</p>
              <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute('/app/practice/drill')}>
                Start today’s drill
              </button>
            </>
          )}
          {streak.canRescue && (
            <p className="qd-pr-rescue" role="note">You missed a few days. Finishing today’s drill rescues your streak.</p>
          )}
        </section>

        <section className="qd-card qd-pr-next" aria-label="Next incident">
          <p className="qd-kicker">Next incident · about {nextIncident ? nextIncident.minutes : '—'} minutes</p>
          {nextIncident ? (
            <>
              <h3 className="qd-pr-cardtitle">{nextIncident.title}</h3>
              <p className="qd-muted">Modeled on a public postmortem by {nextIncident.company}. {nextIncident.level.label}.</p>
              <button
                type="button"
                className="qd-btn qd-btn--primary"
                onClick={() => gotoRoute(`/app/practice/incident?scenario=${encodeURIComponent(nextIncident.id)}`)}
              >
                Open incident
              </button>
            </>
          ) : (
            <p className="qd-muted">No incidents available yet.</p>
          )}
          {entitlements.incidentsLeft !== null && (
            <p className="qd-muted qd-pr-planline">
              Free plan: {entitlements.incidentsLeft} incident {entitlements.incidentsLeft === 1 ? 'start' : 'starts'} left this week.
            </p>
          )}
        </section>

        <section className="qd-card qd-pr-path" aria-label="Your level">
          <p className="qd-kicker">Your level</p>
          <ul className="qd-pr-pathlist">
            {path.map(([n, meta]) => (
              <li
                key={n}
                className={`qd-pr-pathitem${Number(n) === level.level ? ' is-on' : ''}`}
                aria-current={Number(n) === level.level ? 'step' : undefined}
              >
                <span className="qd-pr-pathnum">{n}</span>
                <span>
                  <b>{meta.name}</b>
                  <span>{meta.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="qd-card qd-pr-recent" aria-label="Recent work">
          <p className="qd-kicker">Recent work</p>
          {recent.length === 0 ? (
            <p className="qd-muted">No incidents handled yet. The guided one finishes in under five minutes.</p>
          ) : (
            <ul className="qd-pr-recentlist">
              {recent.map((r) => (
                <li key={r.attemptId}>
                  <button type="button" className="qd-pr-recentbtn" onClick={() => gotoRoute(r.status === 'resolved' ? `/app/practice/record?attempt=${encodeURIComponent(r.attemptId)}` : `/app/practice/incident?attempt=${encodeURIComponent(r.attemptId)}`)}>
                    <span className="qd-pr-recenttitle">{r.title}</span>
                    <span className="qd-pr-recentmeta">
                      {r.status === 'resolved'
                        ? `${r.score !== null ? `${r.score}/100 · ` : ''}${r.hasPostmortem ? 'postmortem written' : 'resolved'}`
                        : 'in progress'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="qd-card qd-pr-catalog" aria-label="Incident library">
        <p className="qd-kicker">The incident library</p>
        <ul className="qd-pr-catlist">
          {catalog.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="qd-pr-catbtn"
                onClick={() => gotoRoute(`/app/practice/incident?scenario=${encodeURIComponent(c.id)}`)}
              >
                <span className="qd-pr-catmain">
                  <b>{c.title}</b>
                  <span className="qd-muted">{c.inspiredByNote}</span>
                </span>
                <span className="qd-pr-catmeta">
                  {c.completed ? <span className="qd-pr-done">Handled</span> : null}
                  <span className="qd-pill">{c.minutes} min</span>
                  <span className="qd-pill">{c.level.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {catalog.length === 0 && <p className="qd-muted">The library is being reviewed — incidents appear here once approved.</p>}
      </section>
    </div>
  );
}
