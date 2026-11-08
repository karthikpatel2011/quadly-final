import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api.js';
import '../practice.css';
import '../dashboard.css';
import './interviews.css';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('quadly:token') || ''}`,
});

const gotoRoute = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

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
    return <div className="qd-ivrhome"><div className="qd-iv-room skeleton" style={{ height: 260 }} /></div>;
  }
  if (phase === 'error') {
    return (
      <div className="qd-ivrhome" role="alert">
        <div className="qd-ivr"><div className="qd-iv-room qd-p__err">
          <h2 className="qd-h2">Interviews couldn’t load</h2>
          <p className="qd-muted">{error}</p>
          <button type="button" className="qd-btn qd-btn--primary" onClick={load}>Retry</button>
        </div></div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const sessions = data?.sessions ?? [];

  return (
    <div className="qd-ivrhome">
      <div className="qd-ivr">
        <header className="qd-iv-boardhead">
          <div>
            <p className="qd-kicker">Interviews</p>
            <h2 className="qd-h2">Your interview room.</h2>
            <p className="qd-muted">Run mock interviews the way the real room runs them — company, role, your resume, out loud.</p>
          </div>
          <button type="button" className="qd-btn qd-btn--primary qd-iv-cta" onClick={() => gotoRoute('/app/interviews/setup')}>
            Start new interview
          </button>
        </header>

        {!caps?.ai && (
          <p className="qd-iv-capsnote" role="note">
            <b>Scripted interviewer active.</b> The conversation engine runs without an AI provider —
            it asks, follows up and scores by rules. For a fully free-form AI interviewer, set{' '}
            <code>LLM_API_KEY</code> in <code>backend/.env</code>; the room switches automatically.
          </p>
        )}

        <div className="qd-iv-stats">
          <div className="qd-iv-stat"><b>{stats.total ?? 0}</b><span>sessions</span></div>
          <div className="qd-iv-stat"><b>{stats.avgScore ?? '—'}</b><span>avg score{stats.avgScore != null ? '/100' : ''}</span></div>
          <div className="qd-iv-stat"><b>{stats.bestScore ?? '—'}</b><span>best{stats.bestScore != null ? '/100' : ''}</span></div>
          <div className="qd-iv-stat"><b>{sessions.filter((s) => s.status === 'active').length}</b><span>in progress</span></div>
        </div>

        <h3 className="qd-iv-section">Recent interviews</h3>
        {sessions.length === 0 ? (
          <p className="qd-iv-empty">No interviews yet. <button type="button" className="qd-linkish" onClick={() => gotoRoute('/app/interviews/setup')}>Run your first mock interview</button> — it takes about fifteen minutes.</p>
        ) : (
          <ul className="qd-iv-sessions">
            {sessions.map((s) => (
              <li key={s.id} className="qd-iv-session">
                <div className="qd-iv-sessionmain">
                  <b>{s.company}</b>
                  <span className="qd-iv-sessionmeta">{s.role} · {s.language} · with {s.persona} · {new Date(s.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="qd-iv-sessionact">
                  {s.status === 'completed' && s.score != null && <span className="qd-pill">{s.score}/100</span>}
                  {s.status === 'completed'
                    ? <button type="button" className="qd-btn" onClick={() => gotoRoute(`/app/interviews/report?session=${s.id}`)}>Report</button>
                    : <button type="button" className="qd-btn qd-btn--primary" onClick={() => gotoRoute(`/app/interviews/mock?session=${s.id}`)}>Resume</button>}
                  <button type="button" className="qd-linkish" disabled={busy} onClick={() => remove(s.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="qd-iv-section">Recommended practice</h3>
        <div className="qd-iv-strip">
          <button type="button" className="qd-iv-chip" onClick={() => gotoRoute('/app/interviews/mock?quick=1')}>Quick HR round (~10 min)</button>
          <button type="button" className="qd-iv-chip" onClick={() => gotoRoute('/app/interviews/setup')}>Technical deep-dive</button>
          <button type="button" className="qd-iv-chip" onClick={() => gotoRoute('/app/practice/replay')}>Revisit daily-practice mistakes</button>
        </div>
      </div>
    </div>
  );
}
