import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../workspace.css';
import './interviews.css';

/* Interview Studio dashboard — warm obsidian surfaces, one amber glow, a
   compact engine-status pill (never a banner), three tactile mode cards, a
   custom-room launcher, and a slim telemetry footer with real session data.
   No sample sessions, no dummy scores. */

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const gotoRoute = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

const MODES = [
  {
    preset: 'technical',
    title: 'Technical deep-dive',
    sub: 'Architecture, edge cases, and live follow-up probing on your stack.',
    badge: '~/system-design',
    duration: '~15 min',
    featured: true,
  },
  {
    preset: 'hr',
    title: 'Quick HR round',
    sub: 'Story framing, ownership questions, and clear communication under pressure.',
    wave: true,
    duration: '~10 min',
  },
  {
    preset: 'replay',
    title: 'Mistake replay',
    sub: 'Defend and explain the exact incidents and concepts you handled in Practice.',
    badge: 'Weak-spot drill',
  },
];

export default function InterviewsDashboard() {
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [caps, setCaps] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setPhase('loading');
    Promise.all([
      apiFetch('/interviews/sessions', { headers: authHeaders() }),
      apiFetch('/interviews/capabilities', { headers: authHeaders() }).catch(() => null),
    ])
      .then(([list, capabilities]) => { setData(list); setCaps(capabilities); setPhase('ready'); })
      .catch((err) => {
        if (/401|Not signed in/i.test(err.message)) { window.location.assign('/join'); return; }
        setError(err.message);
        setPhase('error');
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Delete this interview session, transcript and report?')) return;
    setBusy(true);
    try {
      await apiFetch(`/interviews/session/${id}`, { method: 'DELETE', headers: authHeaders() });
      load();
    } finally { setBusy(false); }
  };

  if (phase === 'loading') {
    return (
      <div className="qd-ivs">
        <div className="qd-ivs-in">
          <div className="qm-card skeleton" style={{ height: 120 }} />
          <div className="qd-ivs-bento"><div className="qm-card skeleton" style={{ height: 180 }} /><div className="qm-card skeleton" style={{ height: 180 }} /><div className="qm-card skeleton" style={{ height: 180 }} /></div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="qd-ivs" role="alert">
        <div className="qd-ivs-in">
          <div className="qm-card qd-p__err">
            <h2 className="qm-title">Interviews couldn’t load</h2>
            <p className="qm-dim">{error}</p>
            <button type="button" className="qv2-cta qm-ctasmall" onClick={load}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const sessions = data?.sessions ?? [];
  const telemetry = `${stats.total ?? 0} sessions · ${stats.avgScore != null ? stats.avgScore : '—'} avg · ${stats.bestScore != null ? stats.bestScore : '—'} best`;

  return (
    <div className="qd-ivs">
      <div className="qd-ivs-in">

        <header className="qd-ivs-head">
          <div>
            <p className="qv2-kicker qd-ivs-eyebrow">Interview Studio</p>
            <h2 className="qm-title qd-ivs-title">Your interview room.</h2>
            <p className="qm-dim qd-ivs-sub">Run mock interviews the way the real room runs them — company, role, your resume, out loud.</p>
          </div>
          {caps && (
            <div className="qd-ivs-engpill" role="note">
              <span className={`qd-ivs-engdot${caps.ai ? ' is-ai' : ''}`} aria-hidden="true" />
              <div>
                <b>{caps.ai ? 'AI Engine Active' : 'Scripted Engine Active'}</b>
                {!caps.ai && <span className="qd-ivs-engnote">Set LLM_API_KEY in .env for free-form AI</span>}
              </div>
            </div>
          )}
        </header>

        <div className="qd-ivs-bento">
          {MODES.map((m) => (
            <button
              key={m.preset}
              type="button"
              className={`qd-ivs-card${m.featured ? ' qd-ivs-card--featured' : ''}`}
              onClick={() => (m.preset === 'replay' ? gotoRoute('/app/practice') : gotoRoute(`/app/interviews/setup?preset=${m.preset}`))}
            >
              <span className="qd-ivs-cardtop">
                {m.wave ? (
                  <span className="qd-ivs-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                ) : (
                  <span className="qd-ivs-badgetxt">{m.badge}</span>
                )}
                {m.duration && <span className="qd-ivs-dur">{m.duration}</span>}
                <span className="qd-ivs-arrow" aria-hidden="true">→</span>
              </span>
              <span className="qd-ivs-cardtxt">
                <b>{m.title}</b>
                <span>{m.sub}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="qd-ivs-custom">
          <p>Want a custom room? Pick company, role, and paste your resume.</p>
          <button type="button" className="qd-ivs-cta" onClick={() => gotoRoute('/app/interviews/setup')}>
            Start custom interview →
          </button>
        </div>

        <div className="qd-ivs-recenthead">
          <p className="qd-ivs-recenttitle">Recent sessions</p>
          <span className="qd-ivs-telemetry">{telemetry}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="qd-ivs-empty" role="status">
            <span>Your completed recordings, transcripts, and rubric scores will appear here.</span>
            <span className="qd-ivs-emptyarrow">↑</span>
          </div>
        ) : (
          <ul className="qd-iv-sessions">
            {sessions.map((s) => (
              <li key={s.id} className="qd-iv-session">
                <div className="qd-iv-sessionmain">
                  <b>{s.company}</b>
                  <span className="qd-iv-sessionmeta">{s.role} · {s.language} · with {s.persona} · {new Date(s.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="qd-iv-sessionact">
                  {s.status === 'completed' && s.score != null && <span className="qd-pill qd-ivs-score">{s.score}/100</span>}
                  {s.status === 'completed'
                    ? <button type="button" className="qd-btn" onClick={() => gotoRoute(`/app/interviews/report?session=${s.id}`)}>Report</button>
                    : <button type="button" className="qd-btn qd-ivs-resume" onClick={() => gotoRoute(`/app/interviews/mock?session=${s.id}`)}>Resume</button>}
                  <button type="button" className="qd-linkish" disabled={busy} onClick={() => remove(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
